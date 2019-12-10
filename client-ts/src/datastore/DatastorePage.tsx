import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useHistory, withRouter } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
import { createStyles, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Snackbar, StyleRules, WithStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { css } from 'glamor';
import { Div } from 'glamorous';
// import DatastoreKind from './DatastoreKind';

const styles: StyleRules = createStyles({});

interface OwnProps extends RouteComponentProps<{ namespace: string | undefined }>, WithStyles<typeof styles, true> {
  id: string,
  kind?: string,
}

const DatastorePage: React.FC<OwnProps> = ({ id, kind, match, theme }) => {
  const history = useHistory();

  const [loadingNamespaces, setLoadingNamespaces] = useState(false);
  const [namespaces, setNamespaces] = useState<(string | null)[]>([null]);
  const [loadingKinds, setLoadingKinds] = useState(false);
  const [kinds, setKinds] = useState<string[]>([]);

  const namespace = match && match.params.namespace !== '[default]' ? match.params.namespace : undefined;

  useEffect(() => {
    setLoadingNamespaces(true);
    setNamespaces([null]);
    setKinds([]);

    axios.get(`/datastore/${id}/namespaces`)
      .then((resp: AxiosResponse<string[]>) => setNamespaces(resp.data))
      .catch(console.error) // TODO
      .finally(() => setLoadingNamespaces(false));
  }, [id]);

  useEffect(() => {
    setLoadingKinds(true);
    setKinds([]);

    axios.get(`/datastore/${id}/${namespace || '[default]'}/kinds`)
      .then((resp: AxiosResponse<string[]>) => setKinds(resp.data))
      .catch(console.error) // TODO
      .finally(() => setLoadingKinds(false));
  }, [id, namespace]);

  return (
    <Div display="flex" height="100%">
      <Div display="flex" flexDirection="column" overflow="auto" width={240} borderRight={`1px solid ${theme.palette.divider}`}>
        <Div padding={10}>
          <FormControl fullWidth>
            <InputLabel shrink htmlFor="namespace">Namespace</InputLabel>
            <Select
              displayEmpty value={namespace || ''} inputProps={{ name: 'namespace' }}
              onChange={e => history.push(`/${id}/${e.target.value || '[default]'}`)}
            >
              {namespaces.map(n => <MenuItem key={n || ''} value={n || ''}>{n || 'Default'}</MenuItem>)}
            </Select>
          </FormControl>
        </Div>
        <List dense>
          {kinds.map(k => {
            let classes = undefined;
            if (k === kind) {
              classes = {
                root: css({ backgroundColor: `${theme.palette.action.selected} !important` }).toString(),
              };
            }

            return (
              <ListItem key={k} button component={Link} to={`/${id}/${namespace || '[default]'}/${k}`} classes={classes}>
                <ListItemText primary={k}/>
              </ListItem>
            );
          })}
        </List>
      </Div>
      {/*{kind && <DatastoreKind id={id} namespace={namespace} kind={kind}/>}*/}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={loadingNamespaces || loadingKinds}
        message="Loading..."
      />
    </Div>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(DatastorePage));

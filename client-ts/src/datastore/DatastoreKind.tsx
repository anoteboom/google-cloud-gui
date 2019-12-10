import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Checkbox, IconButton, Snackbar } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import { css } from 'glamor';
import { Div } from 'glamorous';
import { flatMap, last, sortBy } from 'lodash';
import { AutoSizer, Column, InfiniteLoader, Table } from 'react-virtualized';
import ConfirmDialog from '../ConfirmDialog';
import { QueryResult } from '../model/QueryResult';
import 'react-virtualized/styles.css';

interface OwnProps {
  id: string,
  namespace?: string,
  kind: string,
}

const DatastoreKind: React.FC<OwnProps> = ({ id, namespace, kind }) => {
  const [entities, setEntities] = useState<{ [key: string]: any }[] | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [moreResults, setMoreResults] = useState(true);
  const [columns, setColumns] = useState<{ [key: string]: any }[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<{ id: string, kind: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptDelete, setPromptDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewedEntity, setViewedEntity] = useState<{ [key: string]: any } | null>(null);

  const getQueryResults = (): Promise<any> => {
    if (!moreResults) {
      return Promise.resolve();
    }
    setMoreResults(false);

    return axios.get(`/datastore/${id}/${namespace}/kinds/${kind}/query`, { params: { cursor } })
      .then(({ data }) => QueryResult.parse(data))
      .then((queryResult: QueryResult) => {
        const allEntities = [...(entities || []), ...queryResult.entities];
        const columns = [...new Set(flatMap(allEntities, entity => Object.keys(entity)))];

        setLoading(false);
        setEntities(allEntities);
        setCursor(queryResult.next.endCursor);
        setMoreResults(queryResult.next.moreResults !== 'NO_MORE_RESULTS' && cursor !== queryResult.next.endCursor);
        setColumns(sortBy(columns).map((key: string) => ({
          dataKey: key,
          label: key === '__key__' ? 'ID/Name' : key,
          width: 200
        })));
      });
  };

  const runQuery = (hoge: string = '') => {
    console.log(hoge);
    console.log('runQuery');

    setEntities(null);
    setCursor(undefined);
    setMoreResults(true);
    setColumns([]);
    setSelectedKeys([]);
    setLoading(true);

    getQueryResults()
      .catch(console.error); // TODO
  };

  useEffect(() => {
    runQuery('effect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const renderIdOrName = (key: any): string => {
    const lastPath = last(key.path as ({ id: string, kind: string }[]));
    if (!lastPath) {
      return '';
    }

    return lastPath.id ? lastPath.id : JSON.stringify(lastPath.kind);
  };

  const getRowData = (index: number) => {
    if (!entities || entities.length === 0) {
      return {};
    }

    return (
      Object.assign(
        {},
        Object.entries(entities[index])
          .map(([key, value]) => ({ [key]: key === '__key__' ? renderIdOrName(value) : JSON.stringify(value) })),
      )
    );
  };

  const deleteEntities = () => {

  };

  return (
    <Div flex={1} display="flex" flexDirection="column">
      <Div>
        <Button onClick={() => runQuery()} color="primary"> Refresh </Button>
        <Button onClick={() => setPromptDelete(true)} disabled={selectedKeys.length === 0} color="primary">Delete</Button>
      </Div>
      <Div flex={1} fontSize="small">
        {entities && (
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader isRowLoaded={({ index }) => !!entities[index]} loadMoreRows={getQueryResults} rowCount={entities.length + 1}>
                {({ onRowsRendered, registerChild }) => (
                  <Table
                    headerHeight={30}
                    height={height}
                    onRowsRendered={onRowsRendered}
                    ref={registerChild}
                    rowCount={entities.length}
                    rowGetter={({ index }) => getRowData(index)}
                    rowHeight={30}
                    width={width}
                    headerClassName={css({ textTransform: 'none !important' }).toString()}
                    gridClassName={css({ outline: 'none !important' }).toString()}
                  >
                    <Column
                      dataKey="__key__"
                      minWidth={100}
                      width={100}
                      cellRenderer={({ rowIndex }: { rowIndex: number }) => (
                        <Div display="flex">
                          <Checkbox
                            color="primary"
                            checked={selectedKeys.includes(entities[rowIndex].__key__)}
                            onChange={() => {
                              const key = entities[rowIndex].__key__;
                              setSelectedKeys(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]);
                            }}
                          />
                          <IconButton onClick={() => setViewedEntity(entities[rowIndex])}>
                            <Visibility/>
                          </IconButton>
                        </Div>
                      )}
                    />
                    {columns.map(({ dataKey, label, width }) => (
                      <Column
                        key={dataKey}
                        dataKey={dataKey}
                        label={label}
                        width={width}
                      />
                    ))}
                  </Table>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        )}
      </Div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={deleting || loading}
        message={deleting ? 'Deleting...' : 'Loading...'}
      />
      {/*<EntityDialog*/}
      {/*  entity={viewedEntity}*/}
      {/*  onClose={() => setViewedEntity(null)}*/}
      {/*/>*/}
      {promptDelete && (
        <ConfirmDialog
          text={selectedKeys.length === 1 ? 'Delete entity?' : `Delete ${selectedKeys.length} entities?`}
          confirmLabel="Delete"
          onClose={() => setPromptDelete(false)}
          onConfirmed={deleteEntities}
        />
      )}
    </Div>
  );
};

export default DatastoreKind;

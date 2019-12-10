import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import axios from 'axios';
import { sortBy } from 'lodash';
import { AppBar, createStyles, Divider, Drawer, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, StyleRules, Theme, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import { AddCircle, ChevronLeft, Delete, Menu } from '@material-ui/icons';
import { css } from 'glamor';
import { Div } from 'glamorous';
import ConfirmDialog from './ConfirmDialog';
import ProjectDialog from './ProjectDialog';
import Project from './model/Project';
import DatastorePage from './datastore/DatastorePage';

const styles = (theme: Theme): StyleRules => createStyles({
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
});

interface OwnProps extends RouteComponentProps<{ id: string | undefined, kind: string | undefined }>, WithStyles<typeof styles> {
}

const ProjectList: React.FC<OwnProps> = ({ classes, match }) => {
  const history = useHistory();

  const [projects, setProjects] = useState<Project[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const id = match ? match.params.id : undefined;
  const kind = match ? match.params.kind : undefined;

  const project = id ? projects.find(p => p.id === id) : undefined;
  const removeIdProject = removeId ? projects.find(p => p.id === removeId) : undefined;

  useEffect(() => {
    axios.get('/projects')
      .then(({ data }) => Array.isArray(data) ? data.map((obj: { [key: string]: any }) => Project.parse(obj)) : [])
      .then((list: Project[]) => setProjects(sortBy(list, 'projectId', 'apiEndpoint')))
      .catch(console.error); // TODO
  }, []);

  const addProject = (project: Project) => {
    setProjects(sortBy([...projects, project], 'projectId', 'apiEndpoint'));
    history.push(`/${project.id}`);
  };

  const removeProject = (removeId: string) => {
    axios.delete(`/projects/${removeId}`)
      .then(() => {
        setProjects(projects.filter(p => p.id !== removeId));
        if (id === removeId) {
          history.push('/');
        }
      })
      .catch(console.error); // TODO
  };

  return (
    <Div position="absolute" top={0} bottom={0} left={0} right={0}>
      <Drawer variant="persistent" open={drawerOpen} classes={{ paper: css({ width: 240 }).toString() }}>
        <Toolbar disableGutters>
          <IconButton onClick={() => setProjectDialogOpen(true)} color="primary">
            <AddCircle/>
          </IconButton>
          <Typography variant="subtitle2" color="inherit" className={css({ flex: 1 }).toString()}>
            Projects
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <ChevronLeft/>
          </IconButton>
        </Toolbar>
        <Divider/>
        <List classes={{ root: css({ flex: 1 }).toString() }}>
          {projects.map(({ id, projectId, apiEndpoint }) => (
            <ListItem key={id} button component={Link} to={`/${id}/[default]`}>
              <ListItemText primary={projectId} secondary={apiEndpoint}/>
              <ListItemSecondaryAction>
                <IconButton onClick={() => setRemoveId(id)}>
                  <Delete/>
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Div
        display="flex"
        flexDirection="column"
        height="100%"
        overflow="hidden"
        marginLeft={drawerOpen ? 240 : undefined}
        className={classes.content}
      >
        <AppBar position="static" color="default">
          <Toolbar>
            {!drawerOpen && (
              <IconButton onClick={() => setDrawerOpen(true)}>
                <Menu/>
              </IconButton>
            )}
            <Typography variant="subtitle1">
              {project ? project.title() : 'Google Cloud GUI'}
            </Typography>
          </Toolbar>
        </AppBar>
        <Div flex={1} overflow="hidden">
          {project && <DatastorePage id={project.id} kind={kind}/>}
        </Div>
      </Div>
      {projectDialogOpen && (
        <ProjectDialog
          onClose={() => setProjectDialogOpen(false)}
          onSaved={addProject}
        />
      )}
      {(removeId && removeIdProject) && (
        <ConfirmDialog
          text={`Remove the project ${removeIdProject.projectId} from the list?`}
          confirmLabel="Remove"
          onClose={() => setRemoveId(null)}
          onConfirmed={() => removeProject(removeId)}
        />
      )}
    </Div>
  );
};

export default withStyles(styles)(ProjectList);

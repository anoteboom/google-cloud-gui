import React, { useEffect, useState } from 'react';
import { SwitchProps } from 'react-router';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { sortBy } from 'lodash';
import { AppBar, Divider, Drawer, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Theme, Toolbar, Typography, WithStyles, withStyles } from '@material-ui/core';
import { AddCircle, ChevronLeft, Delete, Menu } from '@material-ui/icons';
import { css } from 'glamor';
import { Div } from 'glamorous';
import Project from './model/Project';

const styles = (theme: Theme) => ({
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  }
});

interface ComputedMatchProps<Params extends { [K in keyof Params]?: string } = {}> {
  isExact: boolean;
  params: Params;
  path: string;
  url: string;
}

interface CustomizeRouterProps<Params extends { [K in keyof Params]?: string } = {}> extends SwitchProps, WithStyles<typeof styles> {
  match: ComputedMatchProps<Params>;
  path: string,
}

const ProjectList: React.FC<CustomizeRouterProps<{ id?: string, kind?: string }>> = ({ classes, match: { params: { id, kind } } }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const project: Project | undefined = id ? projects.find(p => p.id === id) : undefined;

  useEffect(() => {
    axios.get('/projects')
      .then(({ data }) => Array.isArray(data) ? data.map((obj: { [key: string]: any }) => Project.parse(obj)) : [])
      .then((list: Project[]) => setProjects(sortBy(list, 'projectId', 'apiEndpoint')))
      .catch(console.error); // TODO
  });

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
        {/*<Div flex={1} overflow="hidden">*/}
        {/*  {project && <DatastorePage id={project.id} kind={kind}/>}*/}
        {/*</Div>*/}
      </Div>
      {/*<ProjectDialog*/}
      {/*  open={projectDialogOpen}*/}
      {/*  onClose={() => this.setState({ projectDialogOpen: false })}*/}
      {/*  onSaved={this.addProject}*/}
      {/*/>*/}
      {/*<ConfirmDialog*/}
      {/*  open={!!removeId}*/}
      {/*  text={*/}
      {/*    !!removeId &&*/}
      {/*    `Remove the project ${*/}
      {/*      projects.find(({ id }) => id === removeId).projectId*/}
      {/*    } from the list?`*/}
      {/*  }*/}
      {/*  confirmLabel="Remove"*/}
      {/*  onClose={() => this.setState({ removeId: null })}*/}
      {/*  onConfirm={() => this.removeProject(removeId)}*/}
      {/*/>*/}
    </Div>
  );
};

export default withStyles(styles)(ProjectList);

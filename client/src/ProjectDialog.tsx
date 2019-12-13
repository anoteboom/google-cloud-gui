import React, { useState } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@material-ui/core';
import { Div } from 'glamorous';
import Project from './model/Project';

interface OwnProps {
  onSaved: (project: Project) => void,
  onClose: () => void,
}

const ProjectDialog: React.FC<OwnProps> = ({ onSaved, onClose }) => {
  const [projectId, setProjectId] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const saveConnection = () => {
    axios.post('/projects', { projectId, apiEndpoint })
      .then(({ data }) => Project.parse(data))
      .then(onSaved)
      .catch(console.error) // TODO
      .finally(onClose);
  };

  return (
    <Dialog open fullWidth maxWidth='sm' onClose={onClose}>
      <DialogTitle>New Project Connection</DialogTitle>
      <DialogContent>
        <Div marginBottom={8}>
          <TextField
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            autoFocus
            label="Project ID (required)"
            fullWidth
          />
        </Div>
        <Div>
          <TextField
            value={apiEndpoint}
            onChange={e => setApiEndpoint(e.target.value)}
            type="url"
            label="API endpoint (eg. emulator host:port, optional)"
            fullWidth
          />
        </Div>
      </DialogContent>
      <DialogActions>
        <Button onClick={saveConnection} disabled={!projectId} color="primary">Save</Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;

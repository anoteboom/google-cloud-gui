import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@material-ui/core';

interface OwnProps {
  text: string | JSX.Element,
  confirmLabel: string,
  onConfirmed: () => void,
  onClose: () => void,
}

const ConfirmDialog: React.FC<OwnProps> = ({ text, confirmLabel, onConfirmed, onClose }) => (
  <Dialog open onClose={onClose}>
    <DialogContent>
      <DialogContentText>{text}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => {
          onConfirmed();
          onClose();
        }}
        color="primary"
      >
        {confirmLabel}
      </Button>
      <Button onClick={onClose}>Cancel</Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

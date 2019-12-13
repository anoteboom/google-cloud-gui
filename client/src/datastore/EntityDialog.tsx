import React from 'react';
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import { chain } from 'lodash';
import ReactJson from 'react-json-view';

interface OwnProps {
  entity: { [key: string]: any },
  onClose: () => void,
}

const EntityDialog: React.FC<OwnProps> = ({ entity, onClose }) => (
  <Dialog open onClose={onClose}>
    <DialogContent>
      <ReactJson
        src={chain(entity)
          .toPairs()
          .sortBy(([key]) => key)
          .fromPairs()
          .value()}
        name={false}
        enableClipboard={false}
        displayDataTypes={false}
        displayObjectSize={false}
        style={{ width: 500 }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default EntityDialog;

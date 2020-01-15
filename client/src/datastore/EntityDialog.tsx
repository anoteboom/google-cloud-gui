import React from 'react';
import axios from 'axios';
import { Button, Dialog, DialogActions, DialogContent } from '@material-ui/core';
import { chain } from 'lodash';
import ReactJson, { InteractionProps } from 'react-json-view';

interface OwnProps {
  datastoreId: string,
  namespace?: string,
  entity: { [key: string]: any },
  onClose: () => void,
  onEdited: (updatedEntity: { [key: string]: any }) => void,
}

const EntityDialog: React.FC<OwnProps> = ({ datastoreId, namespace, entity, onClose, onEdited }) => {

  const onEntered = () => {
    // remove edit button of kind

    const objectKeyValList = document.querySelectorAll<HTMLElement>('.object-key-val');
    for (let i = 1; i < objectKeyValList.length; i++) {
      const objectKeyList = objectKeyValList[i].querySelectorAll<HTMLElement>('.object-key');
      for (let j = 0; j < objectKeyList.length; j++) {
        if (objectKeyList[j].innerText === '"__key__"') {
          let editButton = objectKeyValList[i].querySelector('.click-to-edit');
          while (editButton) {
            editButton.remove();
            editButton = objectKeyValList[i].querySelector('.click-to-edit');
          }
        }
      }
    }
  };

  return (
    <Dialog open onClose={onClose} onEntered={onEntered}>
      <DialogContent>
        <ReactJson
          src={chain(entity).toPairs().sortBy(([key]) => key).fromPairs().value()}
          name={false}
          enableClipboard={false}
          displayDataTypes={false}
          displayObjectSize={false}
          onEdit={(edit: InteractionProps) => {
            // @ts-ignore
            const kind = edit.existing_src['__key__']['kind'];
            // @ts-ignore
            const id = edit.existing_src['__key__']['id'];

            const requestBody = Object.assign({}, edit.updated_src);
            // @ts-ignore
            delete requestBody['__key__'];

            axios.put(`/datastore/${datastoreId}/${namespace}/kinds/${kind}/${id}`, requestBody)
              .then(() => onEdited(edit.updated_src))
              .catch(e => {
                // TODO
                console.error(e);
                alert('Failed to update datastore value.');
              });
          }}
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
};

export default EntityDialog;

import express from 'express';
import {
    createShared,
    getUserShared,
    getSharedById,
    addPhotoToShared,
    removePhotoFromShared,
    inviteMember,
    removeMember,
    deleteShared,
} from '../controllers/sharedController';

const sharedRouter = express.Router();

sharedRouter.post('/create', createShared as any);
sharedRouter.get('/', getUserShared as any);
sharedRouter.get('/:id', getSharedById as any);
sharedRouter.post('/:id/add-photo', addPhotoToShared as any);
sharedRouter.delete('/:id/remove-photo/:photoId', removePhotoFromShared as any);
sharedRouter.post('/:id/invite', inviteMember as any);
sharedRouter.delete('/:id/remove-member/:userId', removeMember as any);
sharedRouter.delete('/:id', deleteShared as any);

export default sharedRouter;

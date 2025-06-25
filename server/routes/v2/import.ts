import { Router } from 'express';
import multer from 'multer';
import { handlePianoDeiContiImportV2 } from '../../import-engine/orchestration/handlers/pianoDeiContiHandler';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Rotta per il nuovo motore di importazione del Piano dei Conti
router.post(
  '/import/piano-dei-conti', 
  upload.single('file'), 
  handlePianoDeiContiImportV2
);

export default router; 
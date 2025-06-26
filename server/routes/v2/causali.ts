import { Router } from 'express';
import multer from 'multer';
import { handleCausaleContabileImport } from '../../import-engine/orchestration/handlers/causaleContabileHandler';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  '/import/causali-contabili',
  upload.single('file'),
  handleCausaleContabileImport
);

export default router; 
import { Request, Response, NextFunction } from 'express';
import { VoiceService } from '../voice/voice.service';

export const transcribeAudio = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { language } = req.query;

    // Support base64 or raw body buffer
    let audioBuffer: Buffer;
    let mimeType = (req.headers['content-type'] as string) || 'audio/webm';

    if (req.body && req.body.audioBase64) {
      audioBuffer = Buffer.from(req.body.audioBase64, 'base64');
      mimeType = req.body.mimeType || mimeType;
    } else if (Buffer.isBuffer(req.body)) {
      audioBuffer = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Audio payload missing. Provide audioBase64 or raw audio buffer.',
      });
    }

    const result = await VoiceService.transcribeAudio({
      userId,
      audioBuffer,
      mimeType,
      language: language as string,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const synthesizeSpeech = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'text is required for speech synthesis',
      });
    }

    const result = await VoiceService.synthesizeSpeech({
      userId,
      text,
      voice,
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.audioBuffer.length);
    res.status(200).send(result.audioBuffer);
  } catch (error) {
    next(error);
  }
};

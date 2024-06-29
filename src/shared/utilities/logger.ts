import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = async (req: any, error: any = '') => {
  error = error ? error : undefined;
  const data = {
    path: req.path,
    date: new Date(),
    ...req.body,
    error,
  };
  try {
    axios.post(String(process.env.loggerUrl), data);
  } catch (error) {
    console.log('axios error');
  }
};

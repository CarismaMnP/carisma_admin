export const apiUrlBuilder = (url: string) => {
  if (!url) return '';
  return `${import.meta.env.VITE_API_URL_S3}/${url}`;
};

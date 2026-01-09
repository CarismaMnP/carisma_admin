export const checkFormValidation = (
  name: string,
  link: string,
  price: number | '',
) => {
  return !(!name || !link || price === '' || price === null);
};

export const normalizeJsonField = (value: string) => {
  if (!value?.trim()) return undefined;
  try {
    return JSON.stringify(JSON.parse(value));
  } catch {
    return value;
  }
};

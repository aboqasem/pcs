export const numericTransformer = {
  to: (value: number) => `${value}`,
  from: (value: string) => parseFloat(value),
};

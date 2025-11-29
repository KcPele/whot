export const generateRandomCode = (length: number) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let generatedCode = "";
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    generatedCode += characters[randomIndex];
  }

  return generatedCode;
};

export async function poolAndWaitting<T>(call: () => Promise<T>, timeout: number) {
  for (let i = 0; i < timeout; i++) {
    const result = await call();
    if (result) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

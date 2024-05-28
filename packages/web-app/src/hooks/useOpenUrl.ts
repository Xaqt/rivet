export function useOpenUrl(url: string) {
  return async () => {
    window.open(url, '_blank');
  };
}

/**
 * Downloads structured content to a file.
 *
 * @param content The content to download.
 * @param fileName The name of the file to download.
 */
export function downloadContentToFile<T>(content: T, fileName: string) {
  const blob = new Blob([JSON.stringify(content, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
}

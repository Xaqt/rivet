export function exportTextToFile(fileData: string,
                                 fileName: string,
                                 contentType = "text/plain") {
  const blob = new Blob([fileData], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
}

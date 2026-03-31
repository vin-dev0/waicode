export function groupFilesByDirectory(files: any[], currentPath: string = "") {
  const contents = new Map<string, { name: string, type: 'dir' | 'file', path: string }>();
  
  files.forEach(file => {
    // Ensure path is relative to currentPath and starts correctly
    if (file.path.startsWith(currentPath)) {
      const relativePath = currentPath ? file.path.slice(currentPath.length + 1) : file.path;
      if (!relativePath) return; // Exact match of current folder

      const parts = relativePath.split('/');
      const name = parts[0];
      const fullPath = currentPath ? `${currentPath}/${name}` : name;
      
      if (parts.length > 1) {
        // It's a directory
        contents.set(name, { name, type: 'dir', path: fullPath });
      } else {
        // It's a file
        contents.set(name, { name, type: 'file', path: fullPath });
      }
    }
  });

  return Array.from(contents.values()).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

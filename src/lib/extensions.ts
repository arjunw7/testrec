declare global {
  interface String {
    toProperCase(): string;
  }
}

String.prototype.toProperCase = function(): string {
  return this.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Prevent TypeScript error about missing default export
export {};
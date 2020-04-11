const chunk = <T extends ReadonlyArray<any>>(arr: T, size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

export default chunk;

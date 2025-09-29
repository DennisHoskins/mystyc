export function isErrorWithStatus(e: unknown): e is { status: number } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'status' in e &&
    typeof (e as any).status === 'number'
  );
}  

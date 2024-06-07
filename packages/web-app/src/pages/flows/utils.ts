import { type Workflow } from '../../api/types';

export function getWorkflowTitle(workflow?: Workflow): string {
  if (!workflow) {
    return '';
  }
  const flow = workflow?.project;
  return workflow?.name || flow?.metadata?.title || 'flow';
}

// Todo: Remove. Exists in virtual agent code
export function hexToRgba(hex: string, alpha: number): string | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return null; // Обробка ситуації, коли співпадінь не знайдено
  }

  const r = parseInt(result[1] ?? '', 16);
  const g = parseInt(result[2] ?? '', 16);
  const b = parseInt(result[3] ?? '', 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

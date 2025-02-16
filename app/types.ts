export interface Step {
  id: number;
  title: string;
  description: string;
  dependsOn: number[];
}

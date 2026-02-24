import { inject, Injectable } from "@angular/core";
import { ProblemsApi } from "../../../../data/api";


@Injectable({
  providedIn: 'root'
})
export class TestcasesService {
  private readonly problemsApi = inject(ProblemsApi);

  getTestcases(problemId: string) {
    return this.problemsApi.getTestcases(problemId);
  }
}

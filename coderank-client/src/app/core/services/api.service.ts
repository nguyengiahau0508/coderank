import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams | { [key: string]: any }, skipLoading = false): Observable<T> {
    const headers = this.getHeaders(skipLoading);
    const httpParams = this.buildParams(params);
    
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      headers,
      params: httpParams
    });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, skipLoading = false): Observable<T> {
    const headers = this.getHeaders(skipLoading);
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, skipLoading = false): Observable<T> {
    const headers = this.getHeaders(skipLoading);
    
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, skipLoading = false): Observable<T> {
    const headers = this.getHeaders(skipLoading);
    
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, { headers });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, skipLoading = false): Observable<T> {
    const headers = this.getHeaders(skipLoading);
    
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { headers });
  }

  /**
   * Upload file
   */
  upload<T>(endpoint: string, file: File, additionalData?: any, skipLoading = false): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    let headers = new HttpHeaders();
    if (skipLoading) {
      headers = headers.set('X-Skip-Loading', 'true');
    }
    
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }

  /**
   * Upload file with PATCH method (for updates)
   */
  uploadPatch<T>(endpoint: string, file: File, additionalData?: any, skipLoading = false): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }
    
    let headers = new HttpHeaders();
    if (skipLoading) {
      headers = headers.set('X-Skip-Loading', 'true');
    }
    
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, formData, { headers });
  }

  private getHeaders(skipLoading: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (skipLoading) {
      headers = headers.set('X-Skip-Loading', 'true');
    }
    
    return headers;
  }

  private buildParams(params?: HttpParams | { [key: string]: any }): HttpParams {
    if (!params) {
      return new HttpParams();
    }
    
    if (params instanceof HttpParams) {
      return params;
    }
    
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key].toString());
      }
    });
    
    return httpParams;
  }
}

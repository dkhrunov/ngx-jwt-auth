import { Observable } from 'rxjs';
import { AuthResponseTokens } from './auth-response-tokens.interface';


export interface IAuthApiService {
  /**
   * Make request to logIn user.
   * 
   * Request should return object `{ accessToken: string, refreshToken: string }`.
   * If yours backend return different json, just map your data to necessary object (use`map` RxJs operator).
   * 
   * @param args all arguments.
   */
  login(...args: any[]): Observable<AuthResponseTokens>;

  /**
   * Make request to logOut user.
   * 
   * @param args all arguments.
   */
  logout(...args: any[]): Observable<any>;

  /**
   * Make request to refresh access token.
   * 
   * Request should return object `{ accessToken: string, refreshToken: string }`.
   * If yours backend return different json, just map your data to necessary object (use`map` RxJs operator).
   * 
   * @param args all arguments.
   */
  refresh(...args: any[]): Observable<AuthResponseTokens>;
}

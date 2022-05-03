import { Observable } from 'rxjs';
import { AuthResponseTokens, IAuthApiService } from '../interfaces';

export abstract class BaseAuthApiService implements IAuthApiService {
  public abstract login(...args: any[]): Observable<AuthResponseTokens>;

  public abstract logout(...args: any[]): Observable<any>;

  public abstract refresh(...args: any[]): Observable<AuthResponseTokens>;
}

import { ESamesiteOption } from '../enums';
import { ICookieBuilder } from '../interfaces/cookie-builder.interface';

/** 
 * The Cookie builder.
 * 
 * Helps programmatically create Cookie string.
 */
export class CookieBuilder implements ICookieBuilder {
  private readonly cookie: string;
  private cookieOptions = '';

  constructor(cookie: string) {
    this.cookie = cookie;
  }

  /**
   * Create  a new instance of the class.
   *
   * @param cookie the сookies in the format key=value string.
   */
  public static instantiate(cookie: string): CookieBuilder {
    return new CookieBuilder(cookie);
  }

  /**
   * Sets the URIs to which the Cookie is applied.
   *
   * @param path the URIs to which the Cookie applies.
   */
  public path(path: string): CookieBuilder {
    this.cookieOptions += `; path=${path}`;

    return this;
  }

  /**
   * Sets the URI for which the Cookie is valid.
   *
   * @param domain the URI for which the Cookie is valid.
   */
  public domain(domain: string): CookieBuilder {
    this.cookieOptions += `; domain=${domain}`;

    return this;
  }

  /**
   * Sets the expiration date and time for when a Cookie gets deleted.
   *
   * @param date the expiration date and time for the Cookie as Date instance.
   */
  public expires(date: Date): CookieBuilder {
    const dateInUTC = date.toUTCString();
    this.cookieOptions += `; expires=${dateInUTC}`;

    return this;
  }

  /**
   * Sets the time in seconds for when a Cookie will be deleted.
   * 
   * @param seconds the time in seconds.
   */
  public maxAge(seconds: number): CookieBuilder {
    this.cookieOptions += `; max-age=${seconds}`;

    return this;
  }

  /**
   * Sets the security level of a Cookie.
   * 
   * The Cookie should be transferred only over HTTPS.
   */
  public secure(): CookieBuilder {
    this.cookieOptions += '; secure';

    return this;
  }

  /**
   * Sets the security level of a Cookie.
   * 
   * Protect from so-called XSRF (cross-site request forgery) attacks.
   *
   * @param samesite the type of the samesite option.
   */
  public samesite(samesite: ESamesiteOption): CookieBuilder {
    this.cookieOptions += `; samesite=${samesite}`;

    return this;
  }

  /**
   * Build a configured Cookie.
   */
  public build(): string {
    return this.cookie + this.cookieOptions;
  }
}

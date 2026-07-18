/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HealthzResponseDto {
  /** @example "success" */
  status: string;
  /**
   * 프로세스 레벨 헬스체크(서버 살아있음)
   * @example {"ok":true,"ts":1700000000000}
   */
  data: object;
}

export interface ReadyzResponseDto {
  /** @example "success" */
  status: string;
  /**
   * 서비스 준비 상태(DB 포함)
   * @example {"mongo":"up","ts":1700000000000}
   */
  data: object;
}

export interface ReadyzUnavailableResponseDto {
  /** @example "fail" */
  status: string;
  /**
   * 준비되지 않은 이유 메시지
   * @example "Service not ready (mongo down)"
   */
  message: string;
  /** @example {"mongo":"down","ts":1700000000000} */
  data?: object;
}

export interface GoogleTokenAuthDto {
  /**
   * Google Access Token
   * @example "ya29.a0AfH6SMBx..."
   */
  accessToken?: string;
  /**
   * Google ID Token (iOS/Web에서 사용)
   * @example "eyJhbGciOiJSUzI1NiIs..."
   */
  idToken?: string;
}

export interface GoogleUserResponseDto {
  /**
   * 사용자 고유 ID
   * @example "60f1b2b3c8e8a40015f4c8d1"
   */
  _id: string;
  /**
   * 사용자 이름
   * @example "홍길동"
   */
  name: string;
  /**
   * 사용자 이메일
   * @example "user@gmail.com"
   */
  email: string;
  /**
   * 프로필 사진 URL
   * @example "https://lh3.googleusercontent.com/a/ACg8ocIfvPgD_eecUmPaS9M4-w-2Kt7praV3OYyAMkASOUci0RQOIV8=s96-c"
   */
  picture?: object | null;
  /**
   * 게스트 여부
   * @example false
   */
  isGuest: boolean;
}

export interface ConsentStatusDto {
  /**
   * 모든 필수 동의를 완료했는지 여부
   * @example false
   */
  isAllRequiredConsented: boolean;
  /**
   * 누락된 필수 동의 항목 키 목록
   * @example ["terms_of_service","privacy_policy"]
   */
  missingRequiredConsents: string[];
  /**
   * 사용자 액션(동의 제공)이 필요한지 여부
   * @example true
   */
  requiresAction?: boolean;
}

export interface GoogleLoginResponseDataDto {
  user: GoogleUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "google"
   */
  provider: "google" | "apple" | "email";
  /**
   * JWT 액세스 토큰 (하위 호환성)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  token: string;
  /**
   * JWT 액세스 토큰 (짧은 만료시간, 2시간)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  accessToken: string;
  /**
   * JWT 리프레시 토큰 (긴 만료시간, 30일)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshToken"
   */
  refreshToken: string;
  /**
   * 액세스 토큰 만료시간 (초)
   * @example 7200
   */
  expiresIn: number;
  /** 필수 동의 상태 정보 */
  consents: ConsentStatusDto;
}

export interface GoogleLoginSuccessResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Google 로그인이 성공적으로 완료되었습니다." */
  message: string;
  data: GoogleLoginResponseDataDto;
}

export interface AppleFullName {
  /** 이름 */
  givenName?: string;
  /** 성 */
  familyName?: string;
}

export interface AppleAuthDto {
  /**
   * Apple Identity Token (iOS)
   * @example "eyJraWQiOiJXNldjT0tCIiwiYWxn..."
   */
  identityToken?: string;
  /**
   * Apple Authorization Code (iOS)
   * @example "c1234567890abcdefghijk..."
   */
  authorizationCode?: string;
  /**
   * Apple User Identifier (iOS)
   * @example "000123.abc456def789ghi..."
   */
  user?: string;
  /** 사용자 이름 (iOS, 최초 로그인 시에만 제공) */
  fullName?: AppleFullName;
  /**
   * 이메일 (iOS, 최초 로그인 시에만 제공)
   * @example "user@privaterelay.appleid.com"
   */
  email?: string;
  /**
   * Apple ID Token (Android/Web)
   * @example "eyJraWQiOiJXNldjT0tCIiwiYWxn..."
   */
  id_token?: string;
  /**
   * Apple Authorization Code (Android/Web)
   * @example "c1234567890abcdefghijk..."
   */
  code?: string;
  /** Nonce for security (Android/Web) */
  nonce?: string;
  /** State parameter (Android/Web) */
  state?: string;
  /**
   * 클라이언트 플랫폼 (ios/android/web)
   * @example "web"
   */
  platform?: "ios" | "android" | "web";
}

export interface AppleUserResponseDto {
  /**
   * 사용자 고유 ID
   * @example "680657032be53a7892fe5aff"
   */
  _id: string;
  /**
   * 사용자 이름
   * @example "홍길동"
   */
  name: string;
  /**
   * 사용자 이메일
   * @example "user@example.com"
   */
  email?: object | null;
  /**
   * 프로필 사진 URL (Apple은 항상 null)
   * @example null
   */
  picture?: object | null;
  /**
   * 게스트 사용자 여부
   * @example false
   */
  isGuest: boolean;
}

export interface AppleLoginResponseDataDto {
  user: AppleUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "apple"
   */
  provider: "google" | "apple" | "email";
  /**
   * JWT 액세스 토큰 (하위 호환성)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  token: string;
  /**
   * JWT 액세스 토큰 (짧은 만료시간, 2시간)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  accessToken: string;
  /**
   * JWT 리프레시 토큰 (긴 만료시간, 30일)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshToken"
   */
  refreshToken: string;
  /**
   * 액세스 토큰 만료시간 (초)
   * @example 7200
   */
  expiresIn: number;
  /**
   * 로그인한 플랫폼 정보
   * @example "web"
   */
  platform: "ios" | "android" | "web";
  /** 필수 동의 상태 정보 */
  consents: ConsentStatusDto;
}

export interface AppleLoginSuccessResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Apple 로그인이 성공적으로 완료되었습니다." */
  message: string;
  data: AppleLoginResponseDataDto;
}

export interface RefreshTokenDto {
  /**
   * Refresh Token
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

export interface TokenRefreshResponseDataDto {
  /**
   * 새로 발급된 AccessToken (하위 호환성)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccessToken"
   */
  token: string;
  /**
   * 새로 발급된 AccessToken
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newAccessToken"
   */
  accessToken: string;
  /**
   * 새로 발급된 RefreshToken
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.newRefreshToken"
   */
  refreshToken: string;
  /**
   * AccessToken 만료시간 (초)
   * @example 7200
   */
  expiresIn: number;
}

export interface TokenRefreshResponseDto {
  /** @example "success" */
  status: string;
  data: TokenRefreshResponseDataDto;
  /** @example "토큰이 성공적으로 갱신되었습니다." */
  message: string;
}

export interface LogoutDto {
  /**
   * Refresh Token to invalidate for the current client session. This clears the server-side refresh-token session state; access tokens expire naturally unless logout-all invalidates their token version.
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  refreshToken: string;
}

export interface LogoutResponseDataDto {
  /**
   * Current client refresh-token session has been invalidated on the server.
   * @example "로그아웃되었습니다."
   */
  message: string;
}

export interface LogoutResponseDto {
  /** @example "success" */
  status: string;
  data: LogoutResponseDataDto;
  /** @example "로그아웃이 성공적으로 완료되었습니다." */
  message: string;
}

export interface SendVerificationCodeDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
}

export interface SendVerificationCodeResponseDto {
  /** @example "success" */
  status: string;
  /** @example "인증 코드가 이메일로 발송되었습니다." */
  message: string;
}

export interface VerifyEmailCodeDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * 6-digit verification code
   * @example "123456"
   */
  code: string;
}

export interface VerifyEmailCodeResponseDataDto {
  /**
   * 인증 완료 후 발급되는 토큰
   * @example "verification-token-here"
   */
  verificationToken: string;
}

export interface VerifyEmailCodeResponseDto {
  /** @example "success" */
  status: string;
  /** @example "이메일이 인증되었습니다." */
  message: string;
  data: VerifyEmailCodeResponseDataDto;
}

export interface EmailSignupDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * Password (8-20 characters)
   * @example "password123"
   */
  password: string;
  /**
   * User name
   * @example "John Doe"
   */
  name: string;
  /**
   * Verification token from email verification
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   */
  verificationToken: string;
}

export interface EmailUserResponseDto {
  /**
   * 사용자 고유 ID
   * @example "60f1b2b3c8e8a40015f4c8d1"
   */
  userId: string;
  /**
   * 사용자 이름
   * @example "홍길동"
   */
  name: string;
  /**
   * 사용자 이메일
   * @example "user@example.com"
   */
  email: string;
  /**
   * 게스트 여부
   * @example false
   */
  isGuest: boolean;
}

export interface EmailSignupResponseDataDto {
  user: EmailUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "email"
   */
  provider: "google" | "apple" | "email";
  /**
   * JWT 액세스 토큰 (하위 호환성)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  token: string;
  /**
   * JWT 액세스 토큰
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  accessToken: string;
  /**
   * JWT 리프레시 토큰
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshToken"
   */
  refreshToken: string;
  /** 필수 동의 상태 정보 */
  consents: ConsentStatusDto;
}

export interface EmailSignupResponseDto {
  /** @example "success" */
  status: string;
  /** @example "회원가입이 완료되었습니다." */
  message: string;
  data: EmailSignupResponseDataDto;
}

export interface EmailLoginDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * Password
   * @example "password123"
   */
  password: string;
}

export interface EmailLoginResponseDataDto {
  user: EmailUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "email"
   */
  provider: "google" | "apple" | "email";
  /**
   * JWT 액세스 토큰 (하위 호환성)
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  token: string;
  /**
   * JWT 액세스 토큰
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.accessToken"
   */
  accessToken: string;
  /**
   * JWT 리프레시 토큰
   * @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refreshToken"
   */
  refreshToken: string;
  /** 필수 동의 상태 정보 */
  consents: ConsentStatusDto;
}

export interface EmailLoginResponseDto {
  /** @example "success" */
  status: string;
  /** @example "로그인이 완료되었습니다." */
  message: string;
  data: EmailLoginResponseDataDto;
}

export interface ChangePasswordDto {
  /**
   * Current password
   * @example "oldpassword123"
   */
  currentPassword: string;
  /**
   * New password (8-20 characters)
   * @example "newpassword123"
   */
  newPassword: string;
}

export interface PasswordChangeResponseDto {
  /** @example "success" */
  status: string;
  /** @example "비밀번호가 변경되었습니다." */
  message: string;
}

export interface RequestPasswordResetDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
}

export interface PasswordResetRequestResponseDto {
  /** @example "success" */
  status: string;
  /** @example "비밀번호 재설정 코드가 이메일로 발송되었습니다." */
  message: string;
}

export interface ResetPasswordDto {
  /**
   * Email address
   * @example "user@example.com"
   */
  email: string;
  /**
   * 6-digit verification code
   * @example "123456"
   */
  code: string;
  /**
   * New password (8-20 characters)
   * @example "newpassword123"
   */
  newPassword: string;
}

export interface PasswordResetResponseDto {
  /** @example "success" */
  status: string;
  /** @example "비밀번호가 재설정되었습니다." */
  message: string;
}

export interface EmailCheckResponseDataDto {
  /**
   * 이메일 존재 여부
   * @example false
   */
  exists: boolean;
}

export interface EmailCheckResponseDto {
  /** @example "success" */
  status: string;
  data: EmailCheckResponseDataDto;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title MomentBook Auth
 * @version 2.3.47
 * @contact
 *
 * MomentBook 인증/세션 API 문서
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v2 = {
    /**
     * No description
     *
     * @tags health
     * @name HealthControllerHealthz
     * @summary Health Check (process only)
     * @request GET:/v2/health/healthz
     */
    healthControllerHealthz: (params: RequestParams = {}) =>
      this.request<HealthzResponseDto, any>({
        path: `/v2/health/healthz`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags health
     * @name HealthControllerReadyz
     * @summary Ready Check (includes Mongo ping)
     * @request GET:/v2/health/readyz
     */
    healthControllerReadyz: (params: RequestParams = {}) =>
      this.request<ReadyzResponseDto, ReadyzUnavailableResponseDto>({
        path: `/v2/health/readyz`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthOAuthControllerSignInWithGoogle
     * @summary Google OAuth 인증 시작 (웹 브라우저 리다이렉트)
     * @request GET:/v2/auth/google
     */
    authOAuthControllerSignInWithGoogle: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/v2/auth/google`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthOAuthControllerHandleGoogleCallback
     * @summary Google OAuth Callback
     * @request GET:/v2/auth/google/callback
     */
    authOAuthControllerHandleGoogleCallback: (
      query: {
        code: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any, any>({
        path: `/v2/auth/google/callback`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthOAuthControllerSignInWithGoogleToken
     * @summary Google Token으로 인증 (모바일/웹)
     * @request POST:/v2/auth/google/token
     */
    authOAuthControllerSignInWithGoogleToken: (
      data: GoogleTokenAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<GoogleLoginSuccessResponseDto, any>({
        path: `/v2/auth/google/token`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthOAuthControllerSignInWithApple
     * @summary Apple Sign-In 인증
     * @request POST:/v2/auth/apple
     */
    authOAuthControllerSignInWithApple: (
      data: AppleAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<AppleLoginSuccessResponseDto, any>({
        path: `/v2/auth/apple`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthTokenControllerRefreshToken
     * @summary Access Token 갱신
     * @request POST:/v2/auth/refresh
     */
    authTokenControllerRefreshToken: (
      data: RefreshTokenDto,
      params: RequestParams = {},
    ) =>
      this.request<TokenRefreshResponseDto, any>({
        path: `/v2/auth/refresh`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthTokenControllerLogout
     * @summary 로그아웃 (단일 디바이스)
     * @request POST:/v2/auth/logout
     */
    authTokenControllerLogout: (data: LogoutDto, params: RequestParams = {}) =>
      this.request<LogoutResponseDto, any>({
        path: `/v2/auth/logout`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerSendEmailVerificationCode
     * @summary 이메일 인증 코드 발송
     * @request POST:/v2/auth/email/send-verification
     */
    authEmailControllerSendEmailVerificationCode: (
      data: SendVerificationCodeDto,
      params: RequestParams = {},
    ) =>
      this.request<SendVerificationCodeResponseDto, any>({
        path: `/v2/auth/email/send-verification`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerVerifyEmailCode
     * @summary 이메일 인증 코드 확인
     * @request POST:/v2/auth/email/verify-code
     */
    authEmailControllerVerifyEmailCode: (
      data: VerifyEmailCodeDto,
      params: RequestParams = {},
    ) =>
      this.request<VerifyEmailCodeResponseDto, any>({
        path: `/v2/auth/email/verify-code`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerSignupWithEmail
     * @summary 이메일 회원가입
     * @request POST:/v2/auth/email/signup
     */
    authEmailControllerSignupWithEmail: (
      data: EmailSignupDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailSignupResponseDto, any>({
        path: `/v2/auth/email/signup`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerLoginWithEmail
     * @summary 이메일 로그인
     * @request POST:/v2/auth/email/login
     */
    authEmailControllerLoginWithEmail: (
      data: EmailLoginDto,
      params: RequestParams = {},
    ) =>
      this.request<EmailLoginResponseDto, any>({
        path: `/v2/auth/email/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerChangePassword
     * @summary 비밀번호 변경
     * @request POST:/v2/auth/email/password
     * @secure
     */
    authEmailControllerChangePassword: (
      data: ChangePasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<PasswordChangeResponseDto, any>({
        path: `/v2/auth/email/password`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerRequestPasswordReset
     * @summary 비밀번호 재설정 코드 요청
     * @request POST:/v2/auth/email/request-password-reset
     */
    authEmailControllerRequestPasswordReset: (
      data: RequestPasswordResetDto,
      params: RequestParams = {},
    ) =>
      this.request<PasswordResetRequestResponseDto, any>({
        path: `/v2/auth/email/request-password-reset`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerResetPassword
     * @summary 비밀번호 재설정
     * @request POST:/v2/auth/email/reset-password
     */
    authEmailControllerResetPassword: (
      data: ResetPasswordDto,
      params: RequestParams = {},
    ) =>
      this.request<PasswordResetResponseDto, any>({
        path: `/v2/auth/email/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthEmailControllerCheckEmail
     * @summary 이메일 존재 여부 확인
     * @request GET:/v2/auth/email/check
     */
    authEmailControllerCheckEmail: (
      query: {
        /**
         * Email address to check
         * @example "user@example.com"
         */
        email: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<EmailCheckResponseDto, any>({
        path: `/v2/auth/email/check`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
}

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

export interface ChatCounterpartDto {
  /** @example "6807b9d1f1d9f4f056baf123" */
  userId: string;
  /** @example "Alex Traveler" */
  name: string;
  /** @example "https://cdn.momentbook.com/users/profile.webp" */
  picture?: string;
  /** @example "Slow travel, film camera, seaside cities." */
  biography?: string;
}

export interface ChatRoomSummaryDto {
  /** @example "pX4Jk8Q2LmN7" */
  roomId: string;
  /** @example "direct" */
  type: string;
  counterpart: ChatCounterpartDto;
  /**
   * Latest retained message preview. Omitted when the last message has expired.
   * @example "Nice photos. Which city was this?"
   */
  lastMessagePreview?: string;
  /**
   * Sender of the latest retained message. Omitted when the last message has expired.
   * @example "6807ba35b9bc1dc4023d9abc"
   */
  lastMessageSenderId?: string;
  /**
   * Timestamp of the latest retained message, or null when no retained message remains.
   * @example "2026-04-22T13:21:01.123Z"
   */
  lastMessageAt?: object;
  /**
   * Number of retained/readable messages in this room.
   * @example 3
   */
  messageCount: number;
  /** @example "2026-04-22T13:20:10.123Z" */
  createdAt: string;
  /** @example "2026-04-22T13:21:01.123Z" */
  updatedAt: string;
}

export interface CreateDirectChatRoomDataDto {
  room: ChatRoomSummaryDto;
}

export interface CreateDirectChatRoomResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Direct chat room is ready." */
  message: string;
  data: CreateDirectChatRoomDataDto;
}

export interface ChatRoomsListDataDto {
  rooms: ChatRoomSummaryDto[];
  /** @example 1 */
  total: number;
  /** @example 1 */
  page: number;
  /** @example 1 */
  pages: number;
  /** @example 20 */
  limit: number;
  /** @example false */
  hasMore: boolean;
}

export interface ListChatRoomsResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Chat rooms retrieved successfully." */
  message: string;
  data: ChatRoomsListDataDto;
}

export interface ChatMessagesListDataDto {
  room: ChatRoomSummaryDto;
  messages: ChatMessageDto[];
  /** @example 3 */
  total: number;
  /** @example 1 */
  page: number;
  /** @example 1 */
  pages: number;
  /** @example 50 */
  limit: number;
  /** @example false */
  hasMore: boolean;
}

export interface ListChatMessagesResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Chat messages retrieved successfully." */
  message: string;
  data: ChatMessagesListDataDto;
}

export interface ChatMessageDto {
  /** @example "6807ba35b9bc1dc4023d9abc" */
  messageId: string;
  /** @example "pX4Jk8Q2LmN7" */
  roomId: string;
  /** @example "6807b9d1f1d9f4f056baf123" */
  senderId: string;
  /** @example "text" */
  type: string;
  /** @example "Nice photos. Which city was this?" */
  text: string;
  /** @example "2026-04-22T13:21:01.123Z" */
  createdAt: string;
  /** @example "2026-04-22T13:21:01.123Z" */
  updatedAt: string;
}

export interface CreateChatMessageDataDto {
  room: ChatRoomSummaryDto;
  message: ChatMessageDto;
}

export interface CreateChatMessageResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Message sent successfully." */
  message: string;
  data: CreateChatMessageDataDto;
}

export interface CreateDirectChatRoomDto {
  /**
   * Target active user ObjectId for a direct chat room
   * @example "6807b9d1f1d9f4f056baf123"
   */
  targetUserId: string;
}

export interface CreateChatMessageDto {
  /**
   * Chat message body
   * @maxLength 1000
   * @example "Nice photos. Which city was this?"
   */
  text: string;
  /**
   * Client-generated idempotency key for safe retries
   * @maxLength 128
   */
  clientMessageId?: string;
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
 * @title MomentBook Chat
 * @version 2.3.47
 * @contact
 *
 * MomentBook 채팅 API 문서
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
     * @description Creates a 1:1 direct room with the target user or returns the existing room.
     *
     * @tags chat
     * @name ChatControllerCreateOrGetDirectRoom
     * @summary Create or get a direct chat room
     * @request POST:/v2/chat/rooms/direct
     * @secure
     */
    chatControllerCreateOrGetDirectRoom: (
      data: CreateDirectChatRoomDto,
      params: RequestParams = {},
    ) =>
      this.request<CreateDirectChatRoomResponseDto, void>({
        path: `/v2/chat/rooms/direct`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns the authenticated non-guest user direct chat rooms ordered by latest activity.
     *
     * @tags chat
     * @name ChatControllerListRooms
     * @summary List direct chat rooms
     * @request GET:/v2/chat/rooms
     * @secure
     */
    chatControllerListRooms: (
      query?: {
        /**
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * @max 50
         * @default 20
         * @example 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListChatRoomsResponseDto, void>({
        path: `/v2/chat/rooms`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns paginated retained direct chat messages for a room. Messages are ordered newest first.
     *
     * @tags chat
     * @name ChatControllerGetRoomMessages
     * @summary List room messages
     * @request GET:/v2/chat/rooms/{roomId}/messages
     * @secure
     */
    chatControllerGetRoomMessages: (
      roomId: string,
      query?: {
        /**
         * @default 1
         * @example 1
         */
        page?: number;
        /**
         * @max 100
         * @default 50
         * @example 50
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ListChatMessagesResponseDto, void>({
        path: `/v2/chat/rooms/${roomId}/messages`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Sends a direct chat message via HTTP fallback while keeping MongoDB as the canonical source of truth.
     *
     * @tags chat
     * @name ChatControllerSendMessage
     * @summary Send a direct chat message
     * @request POST:/v2/chat/rooms/{roomId}/messages
     * @secure
     */
    chatControllerSendMessage: (
      roomId: string,
      data: CreateChatMessageDto,
      params: RequestParams = {},
    ) =>
      this.request<CreateChatMessageResponseDto, void>({
        path: `/v2/chat/rooms/${roomId}/messages`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}

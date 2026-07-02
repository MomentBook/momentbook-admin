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

export enum SupportedLocale {
  EnUS = "en-US",
  KoKR = "ko-KR",
  JaJP = "ja-JP",
  ZhCN = "zh-CN",
}

export enum OrphanClusterBasis {
  TIME_SPACE = "TIME_SPACE",
  TIME_ONLY = "TIME_ONLY",
}

export enum PlaceNameSource {
  GooglePlaces = "google_places",
  ReverseGeocode = "reverse_geocode",
  UserInput = "user_input",
  AiSuggestion = "ai_suggestion",
}

export enum ClusterEditType {
  REORDER = "REORDER",
  MERGE = "MERGE",
  SPLIT = "SPLIT",
}

export enum RecapMode {
  PHOTO_ONLY = "PHOTO_ONLY",
}

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

export interface UserProfileDataDto {
  /**
   * 사용자 ID
   * @example "507f1f77bcf86cd799439011"
   */
  _id: string;
  /**
   * OAuth Provider ID
   * @example "107848228778116215867"
   */
  providerId: string;
  /**
   * 인증 제공자
   * @example "google"
   */
  provider: "google" | "apple" | "toss" | "email" | "anonymous" | null;
  /**
   * 사용자 이름
   * @example "홍길동"
   */
  name: string | null;
  /**
   * 사용자 이메일
   * @example "user@example.com"
   */
  email: object | null;
  /**
   * 사용자 자기소개
   * @example "안녕하세요"
   */
  biography: object | null;
  /**
   * 프로필 사진 URL
   * @example "https://example.com/profile.jpg"
   */
  picture: object | null;
  /**
   * 게스트 사용자 여부
   * @example false
   */
  isGuest: boolean;
  /**
   * 디바이스 고유 식별자 (게스트 사용자인 경우에만)
   * @example "test-device-123"
   */
  deviceId: string | null;
  /**
   * 사용자 상태
   * @example "active"
   */
  status: "active" | "inactive" | "deleted";
  /**
   * 생성일시
   * @example "2024-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /**
   * 수정일시
   * @example "2024-01-01T00:00:00.000Z"
   */
  updatedAt: string;
  /**
   * MongoDB 버전
   * @example 0
   */
  __v: number;
}

export interface ConsentStatusDataDto {
  /**
   * 모든 필수 동의 완료 여부
   * @example true
   */
  isAllRequiredConsented: boolean;
  /**
   * 미완료 필수 동의 항목 키 배열
   * @example []
   */
  missingRequiredConsents: string[];
  /**
   * 동의 화면 이동 필요 여부 (UI 편의 플래그)
   * @example false
   */
  requiresAction: boolean;
}

export interface UserProfileSuccessResponseDto {
  /**
   * 응답 상태
   * @example "success"
   */
  status: string;
  /**
   * 응답 메시지
   * @example "User profile retrieved successfully"
   */
  message: string;
  /** 사용자 프로필 데이터 */
  data: UserProfileDataDto;
  /** 동의 상태 정보 */
  consents: ConsentStatusDataDto;
}

export interface PictureUpdateDto {
  /**
   * 이미지 업데이트 액션
   * @example "upload"
   */
  action: "upload" | "remove" | "set_url";
  /**
   * 이미지 데이터. action이 "upload"이면 Base64 인코딩된 이미지, "set_url"이면 URL, "remove"이면 불필요
   * @example "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
   */
  value?: string;
}

export interface UpdateUserProfileDto {
  /**
   * 사용자 이름
   * @example "홍길동"
   */
  name?: string;
  /**
   * 사용자 이메일
   * @example "user@example.com"
   */
  email?: string;
  /**
   * 사용자 자기소개
   * @example "안녕하세요"
   */
  biography?: string;
  /** 프로필 이미지 업데이트. 필드를 생략하면 기존 이미지가 유지됩니다. */
  picture?: PictureUpdateDto;
}

export interface UserProfileUpdateSuccessResponseDto {
  /**
   * 응답 상태
   * @example "success"
   */
  status: string;
  /**
   * 응답 메시지
   * @example "User profile updated successfully"
   */
  message: string;
  /** 업데이트된 사용자 프로필 데이터 */
  data: UserProfileDataDto;
}

export interface BasicSuccessResponseDto {
  /**
   * 응답 상태
   * @example "success"
   */
  status: string;
  /**
   * 응답 메시지
   * @example "User account deactivated successfully"
   */
  message: string;
}

export interface FollowingUserListItemDto {
  /**
   * 팔로우 중인 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  userId: string;
  /**
   * 사용자 표시 이름
   * @example "Jane Doe"
   */
  name: string;
  /**
   * 프로필 이미지 URL
   * @example "https://cdn.momentbook.app/profiles/jane-doe.jpg"
   */
  picture?: string;
  /**
   * 사용자 소개
   * @example "Traveler and photographer"
   */
  biography?: string;
  /**
   * 팔로우한 시각
   * @example "2026-04-18T10:30:00.000Z"
   */
  followedAt: string;
}

export interface FollowingUsersResponseDataDto {
  /** 팔로우 중인 사용자 목록 */
  followingUsers: FollowingUserListItemDto[];
  /**
   * 전체 팔로우 사용자 수
   * @example 12
   */
  total: number;
  /**
   * 현재 페이지 번호
   * @example 1
   */
  page: number;
  /**
   * 전체 페이지 수
   * @example 1
   */
  pages: number;
  /**
   * 페이지당 항목 수
   * @example 20
   */
  limit: number;
}

export interface FollowingUsersResponseDto {
  /** @example "success" */
  status: string;
  data: FollowingUsersResponseDataDto;
}

export interface FollowStateResponseDataDto {
  /**
   * 팔로우 상태를 조회한 대상 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  followingUserId: string;
  /**
   * 현재 팔로우 상태
   * @example true
   */
  isFollowing: boolean;
  /**
   * 팔로우 중인 경우 팔로우가 생성된 시각
   * @example "2026-04-19T10:30:00.000Z"
   */
  followedAt?: string;
}

export interface FollowStateResponseDto {
  /** @example "success" */
  status: string;
  data: FollowStateResponseDataDto;
}

export interface FollowUserResponseDataDto {
  /**
   * 팔로우를 실행한 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a2"
   */
  followerId: string;
  /**
   * 팔로우된 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  followingId: string;
  /**
   * 현재 팔로우 상태
   * @example true
   */
  isFollowing: boolean;
  /**
   * 팔로우 생성 시각
   * @example "2026-04-18T10:30:00.000Z"
   */
  createdAt: string;
}

export interface FollowUserResponseDto {
  /** @example "success" */
  status: string;
  /** @example "사용자를 팔로우했습니다." */
  message: string;
  data: FollowUserResponseDataDto;
}

export interface UnfollowUserResponseDataDto {
  /**
   * 팔로우를 해제한 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a2"
   */
  followerId: string;
  /**
   * 팔로우 해제 대상 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  followingId: string;
  /**
   * 현재 팔로우 상태
   * @example false
   */
  isFollowing: boolean;
  /**
   * 해제 전 실제 팔로우 관계가 존재했는지 여부
   * @example true
   */
  wasFollowing: boolean;
}

export interface UnfollowUserResponseDto {
  /** @example "success" */
  status: string;
  /** @example "사용자 팔로우를 해제했습니다." */
  message: string;
  data: UnfollowUserResponseDataDto;
}

export interface BlockedUserListItemDto {
  /**
   * 차단된 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  userId: string;
  /**
   * 차단된 사용자의 표시 이름
   * @example "Jane Doe"
   */
  name: string;
  /**
   * 차단된 사용자의 프로필 이미지 URL
   * @example "https://cdn.momentbook.app/profiles/jane-doe.jpg"
   */
  picture?: string;
  /**
   * 차단한 시각
   * @example "2026-04-09T10:30:00.000Z"
   */
  blockedAt: string;
}

export interface BlockedUsersResponseDataDto {
  /** 차단한 사용자 목록 */
  blockedUsers: BlockedUserListItemDto[];
  /**
   * 전체 차단 사용자 수
   * @example 3
   */
  total: number;
  /**
   * 현재 페이지 번호
   * @example 1
   */
  page: number;
  /**
   * 전체 페이지 수
   * @example 1
   */
  pages: number;
  /**
   * 페이지당 항목 수
   * @example 20
   */
  limit: number;
}

export interface BlockedUsersResponseDto {
  /** @example "success" */
  status: string;
  data: BlockedUsersResponseDataDto;
}

export interface BlockResponseDataDto {
  /**
   * 차단을 실행한 사용자의 ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a2"
   */
  blockerId: string;
  /**
   * 차단된 사용자의 ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  blockedId: string;
  /**
   * 차단 상태
   * @example true
   */
  isBlocked: boolean;
  /**
   * 차단된 시간
   * @example "2023-01-15T10:30:00.000Z"
   */
  createdAt: string;
}

export interface BlockUserResponseDto {
  /** @example "success" */
  status: string;
  /** @example "사용자가 차단되었습니다." */
  message: string;
  data: BlockResponseDataDto;
}

export interface UnblockUserResponseDto {
  /** @example "success" */
  status: string;
  /** @example "사용자 차단이 해제되었습니다." */
  message: string;
}

export interface BlockedUserDetailDataDto {
  /**
   * 차단된 사용자의 canonical ID
   * @example "60f7b3c4e0b2c4a5d0e8f9a3"
   */
  userId: string;
  /**
   * 차단된 사용자의 표시 이름
   * @example "Jane Doe"
   */
  name: string;
  /**
   * 차단된 사용자의 프로필 이미지 URL
   * @example "https://cdn.momentbook.app/profiles/jane-doe.jpg"
   */
  picture?: string;
  /**
   * 차단된 사용자의 소개
   * @example "Traveler and photographer"
   */
  biography?: string;
  /**
   * 차단한 시각
   * @example "2026-04-09T10:30:00.000Z"
   */
  blockedAt: string;
}

export interface BlockedUserDetailResponseDto {
  /** @example "success" */
  status: string;
  data: BlockedUserDetailDataDto;
}

export interface BlockStatusResponseDataDto {
  /**
   * 해당 사용자가 차단되었는지 여부
   * @example true
   */
  isBlocked: boolean;
}

export interface BlockStatusResponseDto {
  /** @example "success" */
  status: string;
  data: BlockStatusResponseDataDto;
}

export interface SignupConsentItemDto {
  /**
   * 동의 항목의 고유 키
   * @example "terms"
   */
  key: string;
  /**
   * 동의 항목 제목
   * @example "Terms of Service"
   */
  label: string;
  /**
   * 웹 페이지 경로 (앱에서 호스트와 결합)
   * @example "/terms"
   */
  path: string;
  /**
   * 필수 동의 여부
   * @example true
   */
  required: boolean;
  /**
   * 표시 순서
   * @example 1
   */
  order: number;
}

export interface SignupConsentsDataDto {
  /** 동의 항목 목록 */
  consents: SignupConsentItemDto[];
  /**
   * 동의 템플릿 버전
   * @example "1.0.0"
   */
  version: string;
}

export interface SignupConsentsResponseDto {
  /** @example "success" */
  status: string;
  data: SignupConsentsDataDto;
}

export interface UserConsentItemUpdateDto {
  /**
   * 동의 여부
   * @example true
   */
  agreement: boolean;
  /**
   * 동의 항목 키 (예: terms, privacy, community-guidelines, marketing-consent)
   * @example "terms"
   */
  consentType: string;
  /**
   * 동의 내용 (선택, 하위 호환용). 서버는 활성 consent template의 canonical content를 저장합니다.
   * @example "MomentBook 서비스 이용약관에 동의합니다."
   */
  content?: string;
  /**
   * 필수 동의 항목 여부 (선택, 하위 호환용). 서버는 활성 consent template의 canonical required 값을 저장합니다.
   * @example true
   */
  isRequired?: boolean;
}

export interface UpdateUserConsentsDto {
  /**
   * 동의 항목 목록
   * @example [{"consentType":"terms","agreement":true,"content":"MomentBook 서비스 이용약관에 동의합니다.","isRequired":true},{"consentType":"privacy","agreement":true,"content":"MomentBook 개인정보 처리방침에 동의합니다.","isRequired":true}]
   */
  consents: UserConsentItemUpdateDto[];
  /**
   * 동의 템플릿 버전. `GET /v2/consent-templates/signup`에서 받은 version 값을 그대로 전달해야 합니다.
   * @example "1.0.0"
   */
  version: string;
}

export interface ConsentValidationDto {
  /**
   * 모든 필수 동의 항목에 동의했는지 여부
   * @example true
   */
  isAllRequiredConsented: boolean;
  /**
   * 동의하지 않은 필수 항목 키 목록
   * @example []
   */
  missingRequiredConsents: string[];
}

export interface UpdateUserConsentsDataDto {
  /** 동의 검증 결과 */
  validation: ConsentValidationDto;
}

export interface UpdateUserConsentsResponseDto {
  /**
   * 응답 상태
   * @example "success"
   */
  status: string;
  /** 동의 검증 결과 */
  data: UpdateUserConsentsDataDto;
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
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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

export interface TossAuthDto {
  /**
   * Apps-in-Toss mini app authorization code returned by appLogin()
   * @example "8y2t0abc123def456ghi789jkl0mno1p"
   */
  authorizationCode?: string;
  /**
   * Apps-in-Toss referrer. DEFAULT and SANDBOX are both accepted case-insensitively.
   * @example "DEFAULT"
   */
  referrer?: string;
  /**
   * Partner app/web OAuth authorization code returned by Toss redirect
   * @example "toss-partner-auth-code"
   */
  code?: string;
  /**
   * Redirect URI used when requesting the partner app/web Toss authorization code
   * @example "momentbook://oauth/toss"
   */
  redirectUri?: string;
}

export interface TossUserResponseDto {
  /**
   * 사용자 고유 ID
   * @example "680657032be53a7892fe5aff"
   */
  _id: string;
  /**
   * 사용자 이름
   * @example "Toss 사용자"
   */
  name: string;
  /**
   * 사용자 이메일
   * @example "user@example.com"
   */
  email?: object | null;
  /**
   * 프로필 사진 URL (Toss는 현재 항상 null)
   * @example null
   */
  picture?: object | null;
  /**
   * 게스트 사용자 여부
   * @example false
   */
  isGuest: boolean;
}

export interface TossLoginResponseDataDto {
  user: TossUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "toss"
   */
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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

export interface TossLoginSuccessResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Toss 로그인이 성공적으로 완료되었습니다." */
  message: string;
  data: TossLoginResponseDataDto;
}

export interface GuestAuthDto {
  /**
   * 디바이스 고유 식별자 (UUID)
   * @example "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   */
  deviceId: string;
}

export interface GuestUserResponseDto {
  /**
   * 사용자 ID (게스트 ID와 동일)
   * @example "836273c6-1311-40c2-a7e8-30400124f43c"
   */
  userId: string;
  /**
   * 게스트 고유 식별자
   * @example "836273c6-1311-40c2-a7e8-30400124f43c"
   */
  guestId: string;
  /**
   * 디바이스 고유 식별자
   * @example "test-device-12345"
   */
  deviceId: string;
  /**
   * 사용자 이름
   * @example "게스트"
   */
  name: string;
  /**
   * 이메일
   * @example null
   */
  email?: object | null;
  /**
   * 프로필 사진
   * @example null
   */
  picture?: object | null;
  /**
   * 게스트 여부
   * @example true
   */
  isGuest: boolean;
}

export interface GuestLoginResponseDataDto {
  user: GuestUserResponseDto;
  /**
   * 인증 제공자 타입
   * @example "anonymous"
   */
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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
  /** 필수 동의 상태 정보 (게스트는 항상 모든 동의 완료 상태) */
  consents: ConsentStatusDto;
}

export interface GuestLoginSuccessResponseDto {
  /** @example "success" */
  status: string;
  data: GuestLoginResponseDataDto;
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

export interface LogoutAllResponseDataDto {
  /**
   * All active refresh-token sessions for the authenticated user have been invalidated.
   * @example "모든 디바이스에서 로그아웃되었습니다."
   */
  message: string;
  /**
   * Number of invalidated active refresh-token sessions, or 1 when Redis token-version invalidation was applied without MongoDB active-token matches.
   * @example 3
   */
  invalidatedTokens: number;
}

export interface LogoutAllResponseDto {
  /** @example "success" */
  status: string;
  data: LogoutAllResponseDataDto;
  /** @example "3개의 디바이스에서 로그아웃이 완료되었습니다." */
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
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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
  provider: "google" | "apple" | "toss" | "email" | "anonymous";
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

export interface PublicUserItemDto {
  /**
   * User ID
   * @example "507f1f77bcf86cd799439011"
   */
  userId: string;
  /**
   * User display name
   * @example "John Doe"
   */
  name: string;
  /**
   * User avatar URL
   * @example "https://cdn.momentbook.app/avatars/user123.jpg"
   */
  picture?: string;
  /**
   * Number of published journeys
   * @example 5
   */
  publishedJourneyCount: number;
}

export interface PublicUsersDataDto {
  /** List of public users */
  users: PublicUserItemDto[];
  /** Total number of users */
  total: number;
  /** Current page number */
  page: number;
  /** Total number of pages */
  pages: number;
  /** Items per page limit */
  limit: number;
}

export interface PublicUsersResponseDto {
  /** @example "success" */
  status: string;
  data: PublicUsersDataDto;
}

export interface PublicUserProfileDto {
  /**
   * User ID
   * @example "507f1f77bcf86cd799439011"
   */
  userId: string;
  /**
   * User display name
   * @example "John Doe"
   */
  name: string;
  /**
   * User avatar URL
   * @example "https://cdn.momentbook.app/avatars/user123.jpg"
   */
  picture?: string;
  /**
   * User biography
   * @example "Traveler and photographer"
   */
  biography?: string;
  /**
   * Number of published journeys
   * @example 5
   */
  publishedJourneyCount: number;
}

export interface PublicUserProfileResponseDto {
  /** @example "success" */
  status: string;
  data: PublicUserProfileDto;
}

export interface PublicMemoriesOverviewSummaryDto {
  /**
   * Number of publicly visible approved journeys for this user
   * @example 5
   */
  publishedJourneyCount: number;
  /**
   * Number of distinct public-memory regions derived from published journeys
   * @example 3
   */
  regionCount: number;
}

export interface PublicMemoriesOverviewRegionCenterDto {
  /**
   * Latitude of the representative region center
   * @example 37.5665
   */
  lat: number;
  /**
   * Longitude of the representative region center
   * @example 126.978
   */
  lng: number;
}

export interface PublicMemoriesOverviewRegionDto {
  /**
   * Opaque region identifier for this public-memory region.
   * @example "place:ChIJm7u-8H7raDURzR3JzA8pW4M"
   */
  regionId: string;
  /**
   * Human-friendly public region label
   * @example "Gyeongbokgung Palace"
   */
  name: string;
  /**
   * Number of approved public journeys by this user that map to the region
   * @example 2
   */
  journeyCount: number;
  /**
   * Continent inferred from the representative region center. Omitted when the region has no stable center coordinates.
   * @example "asia"
   */
  continent?:
    | "asia"
    | "europe"
    | "north-america"
    | "south-america"
    | "africa"
    | "oceania"
    | "antarctica";
  /** Representative region center for map rendering when coordinate data is available */
  center?: PublicMemoriesOverviewRegionCenterDto;
}

export interface PublicMemoriesOverviewDataDto {
  /**
   * Target user ID
   * @example "507f1f77bcf86cd799439011"
   */
  userId: string;
  /** Summary counts for the public memories view */
  summary: PublicMemoriesOverviewSummaryDto;
  /** Distinct public-memory regions derived from this user’s approved public journeys */
  regions: PublicMemoriesOverviewRegionDto[];
}

export interface PublicMemoriesOverviewResponseDto {
  /** @example "success" */
  status: string;
  data: PublicMemoriesOverviewDataDto;
}

export interface LocalDateTimeContextDto {
  /**
   * Local wall-clock datetime without an offset suffix. Null when unknown.
   * @example "2026-03-30T18:20:00"
   */
  localDateTime?: object | null;
  /**
   * UTC offset minutes captured for this local datetime. Null when unknown or when the time is floating local time.
   * @example 540
   */
  utcOffsetMinutes?: object | null;
  /**
   * IANA time zone identifier captured for this local datetime. Null when unknown.
   * @example "Asia/Seoul"
   */
  timeZoneId?: object | null;
  /**
   * Whether this local datetime is offset-aware, floating local time, or completely unknown.
   * @example "offset_aware"
   */
  localDateTimeType: "offset_aware" | "floating_local" | "unknown";
}

export interface PublishedJourneySeoImageDto {
  /**
   * Representative crawlable image URL for public web metadata and image sitemap generation
   * @example "https://cdn.momentbook.app/journeys/user123/variants/1234567890-abc.display.webp"
   */
  url: string;
  /**
   * Image width in pixels when known
   * @example 1080
   */
  width?: number;
  /**
   * Image height in pixels when known
   * @example 1920
   */
  height?: number;
  /**
   * Short representative alt text when a stable location/caption signal exists
   * @example "Seoul Station"
   */
  alt?: string;
}

export interface PublishedJourneyReviewDto {
  /**
   * Whether the published journey review is approved
   * @example false
   */
  approved: boolean;
  /**
   * Published journey review status
   * @example "PENDING"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface PublishedJourneyItemDto {
  /**
   * Public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Journey ID
   * @example "journey_123"
   */
  journeyId: string;
  /** Author user ID */
  userId: string;
  /** Journey start timestamp (ms) */
  startedAt: number;
  /** Journey end timestamp (ms) */
  endedAt?: number;
  /** Journey-local display context for startedAt. Unknown values are explicit rather than guessed. */
  startedAtLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endedAt. Null when endedAt itself is absent. */
  endedAtLocal?: LocalDateTimeContextDto | null;
  /**
   * Recap stage at publish time. FINALIZED means recap is completed for BI/analytics.
   * @example "FINALIZED"
   */
  recapStage: "NONE" | "FINALIZED";
  /** Number of published photos */
  photoCount: number;
  /**
   * Number of images (deprecated, use photoCount)
   * @deprecated
   */
  imageCount: number;
  /** Preview image URL. Prefers thumbnail/display variants when available and falls back to the full image URL for legacy rows. */
  thumbnailUrl?: string;
  /** Up to three representative crawlable images for public web metadata and image sitemap generation */
  seoImages?: PublishedJourneySeoImageDto[];
  /** Journey metadata */
  metadata?: object;
  /** Published timestamp */
  publishedAt: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp. Public web sitemaps should prefer this for lastmod when present. */
  updatedAt?: string;
  /** Generic review state for this list item. Public feed items are expected to be approved. */
  review: PublishedJourneyReviewDto;
  /**
   * Visibility stored in DB
   * @example "public"
   */
  visibility: "public" | "hidden";
  /**
   * Content availability status for rendering
   * @example "available"
   */
  contentStatus:
    | "available"
    | "reported_hidden"
    | "review_pending"
    | "review_rejected";
}

export interface PublishedJourneysDataDto {
  /** List of published journeys */
  journeys: PublishedJourneyItemDto[];
  /** Exact total number of matching published journeys for this request. */
  total: number;
  /** Current page number for legacy offset pagination responses. Omitted when cursor mode is used. */
  page?: number;
  /** Total number of pages for legacy offset pagination responses. Omitted when cursor mode is used. */
  pages?: number;
  /** Items per page limit */
  limit: number;
  /**
   * Whether additional items remain after this batch. Present for both offset and cursor responses to help discovery UIs preload safely.
   * @example true
   */
  hasMore: boolean;
  /**
   * Opaque cursor for the next recent-order batch. Present only when recent-order cursor pagination can continue.
   * @example "eyJzb3J0QXQiOiIyMDI2LTA0LTAzVDA3OjAwOjAwLjAwMFoiLCJpZCI6IjY2MGQ4MzFhN2FlOGVjYzA0YmQ1OWJiMSJ9"
   */
  nextCursor?: object | null;
  /**
   * Opaque seed applied to `sort=discovery`. Reuse this value when requesting later offset pages of the same discovery session to keep ordering stable. Omitted for non-discovery sorts.
   * @example "V1StGXR8_Z5j"
   */
  discoverySeed?: string;
}

export interface PublishedJourneysResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedJourneysDataDto;
}

export interface RecapInputSummaryDto {
  id: string;
  timeRange: object;
  photoCount: number;
  photoWithGpsCount: number;
  photoWithoutGpsCount: number;
  photoGpsRatio: number;
  photoTimeRange: object;
}

export interface RecapAlgorithmConfigDto {
  clustering: object;
  computedAt: number;
  processingTimeMs?: number;
}

export interface RecapComputedDto {
  clusters: object;
  quality: object;
  totalClusters: number;
  totalDurationMs: number;
}

export interface PhotoAssignment {
  photoId: string;
  targetClusterId: string;
  positionIndex?: number;
}

export interface ClusterEdit {
  clusterId: string;
  /** @example "REORDER" */
  editType: ClusterEditType;
  details: Record<string, any>;
}

export interface RecapOverrides {
  ops: (
    | ({
        type: "ASSIGN_PHOTO_TO_CLUSTER";
      } & AssignPhotoToClusterOp)
    | ({
        type: "HIDE_PHOTO";
      } & HidePhotoOp)
    | ({
        type: "UNHIDE_PHOTO";
      } & UnhidePhotoOp)
    | ({
        type: "REORDER_PHOTOS_IN_CLUSTER";
      } & ReorderPhotosInClusterOp)
    | ({
        type: "MOVE_BETWEEN_CLUSTERS";
      } & MoveBetweenClustersOp)
    | ({
        type: "REORDER_TIMELINE_BLOCKS";
      } & ReorderTimelineBlocksOp)
  )[];
  hiddenPhotoIds: string[];
  manualAssignments: PhotoAssignment[];
  manualClusterEdits: ClusterEdit[];
  blockOrder?: string[];
}

export interface ClusterTimeDto {
  startAt: number;
  endAt: number;
  durationMs: number;
}

export interface ClusterCenterDto {
  lat: number;
  lng: number;
}

export interface ClusterConfidenceDto {
  score: number;
  reasons: string[];
}

export interface PhotoClusterDto {
  clusterId: string;
  basis: "TIME_SPACE" | "TIME_ONLY";
  time: ClusterTimeDto;
  center?: ClusterCenterDto;
  radiusM?: number;
  locationName?: string;
  /** Optional user impression for this cluster */
  impression?: string;
  confidence: ClusterConfidenceDto;
  photoIds: string[];
}

export interface RecapDraftDto {
  /** @example 3 */
  schemaVersion: number;
  draftId: string;
  inputId: string;
  createdAt: number;
  updatedAt: number;
  inputSummary: RecapInputSummaryDto;
  mode: RecapMode;
  algorithm: RecapAlgorithmConfigDto;
  computed: RecapComputedDto;
  overrides: RecapOverrides;
  /** Legacy top-level alias of computed.clusters.photoClusters (v3 contract) */
  photoClusters?: PhotoClusterDto[];
}

export interface JourneyRecapExportMetaDto {
  journeyId: string;
  startedAt: number;
  endedAt?: number;
  /**
   * Legacy GPS sample count
   * @example 0
   */
  locationSampleCount?: number;
  /** @example 128 */
  photoCount: number;
  /** Journey-local display context for startedAt. Unknown values are returned explicitly when legacy data does not contain local-time metadata. */
  startedAtLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endedAt. Null when endedAt itself is absent. */
  endedAtLocal?: LocalDateTimeContextDto | null;
}

export interface JourneyRecapExportTimeRangeDto {
  startAt: number;
  endAt: number;
  durationMs: number;
  /** Local display context for startAt. Unknown values are explicit rather than guessed. */
  startLocal: LocalDateTimeContextDto;
  /** Local display context for endAt. Unknown values are explicit rather than guessed. */
  endLocal: LocalDateTimeContextDto;
}

export interface LocalizedNames {
  /** @example "Seoul" */
  "en-US": string;
  /** @example "서울" */
  "ko-KR"?: string;
  /** @example "東京" */
  "ja-JP"?: string;
  /** @example "首尔" */
  "zh-CN"?: string;
}

export interface LatLng {
  /** @example 37.5665 */
  lat: number;
  /** @example 126.978 */
  lng: number;
}

export interface PlaceInfo {
  /** Localized place names keyed by SupportedLocale */
  names: LocalizedNames;
  /**
   * Legacy alias of names
   * @deprecated
   */
  localizedNames?: LocalizedNames;
  /**
   * Resolved display label for convenience
   * @deprecated
   * @example "Gyeongbokgung Palace"
   */
  displayName?: string;
  /** @example "google_places" */
  source: PlaceNameSource;
  /** @example "ChIJm7u-8H7raDURzR3JzA8pW4M" */
  placeId?: string;
  coordinates?: LatLng;
  /**
   * Unix timestamp in milliseconds
   * @example 1739412345678
   */
  resolvedAt: number;
}

export interface JourneyRecapExportLocationDto {
  /** @example "Gyeongbokgung Palace" */
  displayName?: string;
  /** @example 37.579617 */
  lat?: number;
  /** @example 126.977041 */
  lng?: number;
  /** @example 40 */
  radiusM?: number;
  place?: PlaceInfo;
}

export interface JourneyRecapExportTimelineItemDto {
  /**
   * External timeline item ID (internal cluster IDs are masked)
   * @format uuid
   */
  timelineId: string;
  type: "PHOTO_GROUP" | "ORPHAN_PHOTO";
  time: JourneyRecapExportTimeRangeDto;
  location?: JourneyRecapExportLocationDto;
  /** Optional user impression for this cluster */
  impression?: string;
  /** External photo IDs mapped from internal IDs */
  photoIds: string[];
}

export interface JourneyRecapExportPhotoLocationDto {
  /** @example 37.5665 */
  lat: number;
  /** @example 126.978 */
  lng: number;
}

export interface CaptureTimeContextDto {
  /**
   * Local wall-clock datetime without an offset suffix. Null when unknown.
   * @example "2026-03-30T18:20:00"
   */
  localDateTime?: object | null;
  /**
   * UTC offset minutes captured for this local datetime. Null when unknown or when the time is floating local time.
   * @example 540
   */
  utcOffsetMinutes?: object | null;
  /**
   * IANA time zone identifier captured for this local datetime. Null when unknown.
   * @example "Asia/Seoul"
   */
  timeZoneId?: object | null;
  /**
   * Whether this local datetime is offset-aware, floating local time, or completely unknown.
   * @example "offset_aware"
   */
  localDateTimeType: "offset_aware" | "floating_local" | "unknown";
  /**
   * Provenance of the time zone or offset information.
   * @example "exif_explicit_offset"
   */
  timeZoneSource:
    | "exif_explicit_offset"
    | "gps_derived"
    | "user_input"
    | "unknown";
}

export interface JourneyRecapExportPhotoDto {
  /**
   * External photo ID (internal identifier is masked)
   * @format uuid
   */
  photoId: string;
  takenAt: number;
  /** Portable archive path (client photo URI / archive key) */
  archivePath: string;
  hasGps: boolean;
  location?: JourneyRecapExportPhotoLocationDto;
  width?: number;
  height?: number;
  /** Original capture local-time context preserved from ingest. Unknown values are explicit. */
  captureTime: CaptureTimeContextDto;
}

export interface JourneyRecapExportDraftDto {
  schemaVersion: number;
  draftId: string;
  mode: RecapMode;
  createdAt: number;
  updatedAt: number;
  journey: JourneyRecapExportMetaDto;
  timeline: JourneyRecapExportTimelineItemDto[];
  photos: JourneyRecapExportPhotoDto[];
}

export interface PublishedJourneyTimeRangeDto {
  /** Absolute range start timestamp (ms) */
  startAt: number;
  /** Absolute range end timestamp (ms) */
  endAt: number;
  /** Absolute duration in milliseconds */
  durationMs: number;
  /** Journey-local display context for startAt. Unknown values are explicit rather than guessed. */
  startLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endAt. Unknown values are explicit rather than guessed. */
  endLocal: LocalDateTimeContextDto;
}

export interface RecapTimeRange {
  startAt: number;
  endAt: number;
  durationMs: number;
}

export interface ClusterConfidence {
  /** @example 0.92 */
  score: number;
  /** @example ["density_high","time_stable"] */
  reasons: string[];
}

export interface RecapOperationFrom {
  clusterId?: string;
}

export interface RecapOperationTo {
  clusterId: string;
  positionIndex?: number;
}

export interface AssignPhotoToClusterOp {
  opId: string;
  /** @example "ASSIGN_PHOTO_TO_CLUSTER" */
  type: "ASSIGN_PHOTO_TO_CLUSTER";
  photoId: string;
  from: RecapOperationFrom;
  to: RecapOperationTo;
  atMs: number;
}

export interface HidePhotoOp {
  opId: string;
  /** @example "HIDE_PHOTO" */
  type: "HIDE_PHOTO";
  photoId: string;
  atMs: number;
  reason?: string;
}

export interface UnhidePhotoOp {
  opId: string;
  /** @example "UNHIDE_PHOTO" */
  type: "UNHIDE_PHOTO";
  photoId: string;
  atMs: number;
}

export interface ReorderPhotosInClusterOp {
  opId: string;
  /** @example "REORDER_PHOTOS_IN_CLUSTER" */
  type: "REORDER_PHOTOS_IN_CLUSTER";
  clusterId: string;
  photoOrder: string[];
  atMs: number;
}

export interface MoveBetweenClustersOp {
  opId: string;
  /** @example "MOVE_BETWEEN_CLUSTERS" */
  type: "MOVE_BETWEEN_CLUSTERS";
  photoId: string;
  fromClusterId: string;
  toClusterId: string;
  atMs: number;
}

export interface ReorderTimelineBlocksOp {
  opId: string;
  /** @example "REORDER_TIMELINE_BLOCKS" */
  type: "REORDER_TIMELINE_BLOCKS";
  blockOrder: string[];
  atMs: number;
}

export interface PhotoGroupBlock {
  blockId: string;
  /** @example "PHOTO_GROUP" */
  type: "PHOTO_GROUP";
  time: RecapTimeRange;
  location?: LatLng;
  place?: PlaceInfo;
  /**
   * Use place.names instead
   * @deprecated
   */
  placeName?: string;
  photos: string[];
  hiddenPhotos: string[];
  /** @example "TIME_ONLY" */
  basis: OrphanClusterBasis;
}

export interface OrphanCluster {
  clusterId: string;
  /** @example "TIME_SPACE" */
  basis: "TIME_SPACE" | "TIME_ONLY";
  time: RecapTimeRange;
  center?: LatLng;
  /** @example 42 */
  radiusM?: number;
  place?: PlaceInfo;
  /**
   * Use place.names instead
   * @deprecated
   * @example "Gyeongbokgung Palace"
   */
  locationName?: string;
  confidence: ClusterConfidence;
  photoIds: string[];
}

export interface OrphanPhoto {
  photoId: string;
  /** @example ["no_cluster_match"] */
  reasons: string[];
}

export interface RecapUnmappedLeftovers {
  clusters: OrphanCluster[];
  photos: OrphanPhoto[];
}

export interface UnassignedPhoto {
  photoId: string;
  takenAt: number;
  /** @example "no_gps" */
  reason: "no_gps";
  originalClusterId?: string;
}

export interface RecapFinalStats {
  totalBlocks: number;
  totalPhotos: number;
  hiddenPhotos: number;
  unassignedPhotos: number;
  startTime: number;
  endTime: number;
  durationMs: number;
}

export interface RecapFinal {
  timelineBlocks: PhotoGroupBlock[];
  leftoverPhotos: RecapUnmappedLeftovers;
  /**
   * Legacy alias. Use leftoverPhotos instead
   * @deprecated
   */
  unmappedLeftovers?: RecapUnmappedLeftovers;
  /**
   * Legacy alias. Use leftoverPhotos.photos instead
   * @deprecated
   */
  orphanPhotos?: OrphanPhoto[];
  unassignedPhotos: UnassignedPhoto[];
  stats: RecapFinalStats;
}

export interface SupportedLocaleValue {
  /** @example "ko-KR" */
  value: SupportedLocale;
}

export interface JourneyMetadataDto {
  /**
   * User-defined journey title
   * @example "Trip to Seoul"
   */
  title?: string;
  /**
   * User reflection or notes about the journey
   * @example "A wonderful journey exploring the city"
   */
  description?: string;
  /**
   * Primary language of title/description/impressions. Used as the source language when the server materializes localized content during admin approval. Supported values: ko, en, ja, zh, es, pt, fr, th, vi.
   * @example "ko"
   */
  sourceLanguage?: string;
  /**
   * Thumbnail photo URL. Must match one of the published image URLs.
   * @example "https://cdn.momentbook.app/journeys/user123/thumbnail.jpg"
   */
  thumbnailUri?: string;
}

export interface JourneyImageLocationDto {
  /**
   * Latitude coordinate
   * @example 37.5665
   */
  latitude: number;
  /**
   * Longitude coordinate
   * @example 126.978
   */
  longitude: number;
}

export interface PublishIntentAssetRequestDto {
  /**
   * @maxLength 128
   * @example "publish-0-photo-1"
   */
  clientRef: string;
  /**
   * @maxLength 256
   * @example "external-photo-1"
   */
  photoId: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  /**
   * @min 1
   * @max 5242880
   * @example 1048576
   */
  sizeBytes: number;
  takenAt?: number;
  location?: JourneyImageLocationDto;
  locationName?: string;
  captureTime?: CaptureTimeContextDto;
}

export interface CreatePublishIntentRequestDto {
  /** @example "550e8400-e29b-41d4-a716-446655440000" */
  idempotencyKey: string;
  /**
   * SHA-256 digest of the immutable client publish snapshot
   * @example "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
   */
  snapshotDigest: string;
  /** @example "36a2d200-74d1-43ed-9265-8626b0eb2881" */
  journeyId: string;
  /** @example 1704067200000 */
  startedAt: number;
  endedAt?: number;
  startedAtLocal?: LocalDateTimeContextDto;
  endedAtLocal?: LocalDateTimeContextDto;
  recapDraft: RecapDraftDto | JourneyRecapExportDraftDto;
  recapStage: "FINALIZED";
  metadata?: JourneyMetadataDto;
  coverPhotoId?: string;
  assets: PublishIntentAssetRequestDto[];
}

export interface CreatePublishIntentResponseDto {
  /** @example "success" */
  status: string;
  data: {
    publishOperationId?: string;
    publicId?: string;
    publishPhase?:
      | "UPLOADING"
      | "FINALIZING"
      | "REVIEW_PENDING"
      | "REVIEW_REJECTED"
      | "PUBLIC"
      | "FAILED"
      | "EXPIRED"
      | "CANCELLED";
    expiresAt?: string;
    assets?: any[];
  };
}

export interface CancelPublishIntentResponseDto {
  /** @example "success" */
  status: string;
  data: {
    publishOperationId?: string;
    publishPhase?: "CANCELLED";
  };
}

export interface JourneyImageDto {
  /**
   * Server-issued asset upload identifier from a publish intent.
   * @example "asset_abc123"
   */
  assetId?: string;
  /**
   * Canonical public asset URL of the uploaded image
   * @example "https://cdn.momentbook.app/journeys/user123/1234567890-abc.jpg"
   */
  url: string;
  /** Canonical public URL of the original full-size image. Defaults to url for legacy clients. */
  fullUrl?: string;
  /** Optional display variant URL. */
  displayUrl?: string;
  /** Optional thumbnail variant URL. */
  thumbnailUrl?: string;
  /** Public photo identifier (URL-safe) */
  photoId?: string;
  /**
   * Image width in pixels
   * @example 1080
   */
  width?: number;
  /**
   * Image height in pixels
   * @example 1920
   */
  height?: number;
  /** Photo captured time (ms) */
  takenAt?: number;
  /** Optional location coordinates */
  location?: JourneyImageLocationDto;
  /** Optional human-friendly location label */
  locationName?: string;
  /** Original capture local-time context preserved from ingest. Unknown values should be sent explicitly rather than guessed. */
  captureTime?: CaptureTimeContextDto;
}

export interface PublishJourneyRequestDto {
  /**
   * DEPRECATED: No longer supported. Lambda-backed variant generation has been removed.
   * @deprecated
   * @default false
   */
  deferUntilAssetsReady?: boolean;
  /**
   * Journey ID (client-side)
   * @example "journey_abc123"
   */
  journeyId: string;
  /**
   * Journey start timestamp (ms)
   * @example 1704067200000
   */
  startedAt: number;
  /** Journey end timestamp (ms) */
  endedAt?: number;
  /** Optional journey-local context for startedAt. Use unknown/null rather than guessing when the local context cannot be determined. */
  startedAtLocal?: LocalDateTimeContextDto;
  /** Optional journey-local context for endedAt. Use unknown/null rather than guessing when the local context cannot be determined. */
  endedAtLocal?: LocalDateTimeContextDto;
  /** RecapDraft payload. Supports computed format and export-safe format. */
  recapDraft: RecapDraftDto | JourneyRecapExportDraftDto;
  /**
   * Recap stage. Publish requires FINALIZED. BI/analytics should treat FINALIZED as "recap completed".
   * @example "FINALIZED"
   */
  recapStage: "FINALIZED";
  /**
   * Photo reference to published image URL mapping. For computed drafts, use the client photo identifier/local URI. For export-safe drafts, either photos[].archivePath or photos[].photoId may be used as the key.
   * @example {"file:///local/photo1.jpg":"https://cdn.momentbook.app/journeys/user123/img1.jpg","file:///local/photo2.jpg":"https://cdn.momentbook.app/journeys/user123/img2.jpg"}
   */
  photoUrlMapping: object;
  /** Array of journey images to publish. Client may send the full published photo set for the journey. */
  images: JourneyImageDto[];
  /** Journey metadata (title, description, thumbnailUri, etc.) */
  metadata?: JourneyMetadataDto;
}

export interface PublishJourneyResponseDto {
  /**
   * Status of the request
   * @example "success"
   */
  status: string;
  /** Published journey data */
  data: {
    /** Unique public identifier for the journey */
    publicId?: string;
    /** ISO timestamp of creation */
    createdAt?: string;
    /** Whether the journey is currently published */
    published?: boolean;
    /** Whether the publish request was accepted and is still being finalized */
    isPublishing?: boolean;
    publishOperationId?: string;
    publishPhase?:
      | "UPLOADING"
      | "FINALIZING"
      | "REVIEW_PENDING"
      | "REVIEW_REJECTED"
      | "PUBLIC"
      | "FAILED"
      | "EXPIRED"
      | "CANCELLED";
  };
}

export interface PublishJourneyInfoResponseDto {
  /**
   * Status of the request
   * @example "success"
   */
  status: string;
  /** Publish info for the journey */
  data: {
    published?: boolean;
    isPublishing?: boolean;
    publicId?: string;
    publishedUrl?: string;
    publishedAt?: string;
    lastPublishError?: string;
    lastPublishErrorCode?: string;
    publishOperationId?: string;
    publishPhase?:
      | "UPLOADING"
      | "FINALIZING"
      | "REVIEW_PENDING"
      | "REVIEW_REJECTED"
      | "PUBLIC"
      | "FAILED"
      | "EXPIRED"
      | "CANCELLED";
    publishProgress?: number;
    publishExpiresAt?: string;
    createdAt?: string;
    updatedAt?: string;
    /**
     * Deprecated compatibility field. Always false because location enrichment APIs were removed.
     * @deprecated
     */
    isLocationEnriched?: boolean;
  };
}

export interface PublishedJourneyImageDto {
  /**
   * Stable published photo identifier for public timeline/media reconstruction
   * @example "external-photo-1"
   */
  photoId: string;
  /**
   * Legacy public URL of the published full-size image asset. Kept as an alias of fullUrl for existing clients.
   * @example "https://cdn.momentbook.app/journeys/user123/1234567890-abc.jpg"
   */
  url: string;
  /**
   * Public URL of the original full-size published image asset
   * @example "https://cdn.momentbook.app/journeys/user123/1234567890-abc.jpg"
   */
  fullUrl: string;
  /**
   * Public URL of the display variant. Falls back to fullUrl.
   * @example "https://cdn.momentbook.app/journeys/user123/variants/1234567890-abc.display.webp"
   */
  displayUrl: string;
  /**
   * Public URL of the thumbnail variant. Falls back to fullUrl.
   * @example "https://cdn.momentbook.app/journeys/user123/variants/1234567890-abc.thumbnail.webp"
   */
  thumbnailUrl: string;
  /**
   * Image width in pixels
   * @example 1080
   */
  width?: number;
  /**
   * Image height in pixels
   * @example 1920
   */
  height?: number;
  /** Photo captured time (ms) */
  takenAt?: number;
  /** Optional location coordinates kept for public image parity */
  location?: JourneyImageLocationDto;
  /** Optional human-friendly location label */
  locationName?: string;
  /** Original capture local-time context preserved from ingest. Unknown values are explicit rather than guessed. */
  captureTime?: CaptureTimeContextDto;
}

export interface PublishedJourneyLocalizationEntryDto {
  /**
   * BCP 47 locale for the localized content
   * @example "pt-BR"
   */
  locale: string;
  /**
   * Primary language code
   * @example "pt"
   */
  languageCode: string;
  /**
   * Country code used for this localization
   * @example "BR"
   */
  countryCode: string;
  /**
   * Human-friendly language label
   * @example "Portuguese"
   */
  languageName: string;
  /**
   * Localized journey title
   * @example "서울에서 보낸 봄날"
   */
  title?: string;
  /**
   * Localized journey description
   * @example "도시의 공기와 강변의 저녁빛을 천천히 담아낸 산책 기록"
   */
  description?: string;
  /**
   * Localized hashtags derived from title, description, and impressions
   * @example ["#서울여행","#한강산책","#봄저녁"]
   */
  hashtags: string[];
}

export interface PublishedJourneyClusterLocalizationEntryDto {
  /**
   * BCP 47 locale for the localized impression
   * @example "ja-JP"
   */
  locale: string;
  /**
   * Primary language code
   * @example "ja"
   */
  languageCode: string;
  /**
   * Country code used for this localization
   * @example "JP"
   */
  countryCode: string;
  /**
   * Human-friendly language label
   * @example "Japanese"
   */
  languageName: string;
  /**
   * Localized cluster impression
   * @example "川沿いの空気が静かで心地よかった"
   */
  impression?: string;
}

export interface PublishedJourneyClusterLocalizedImpressionsDto {
  /**
   * Cluster ID from the published journey timeline
   * @example "timeline-1"
   */
  clusterId: string;
  /** Localized impressions for each supported locale */
  translations: PublishedJourneyClusterLocalizationEntryDto[];
}

export interface PublishedJourneyLocalizedContentDto {
  /**
   * Source language used for localization generation
   * @example "ko"
   */
  sourceLanguage: string;
  /**
   * ISO timestamp when localized content was generated
   * @example "2026-03-28T10:15:00.000Z"
   */
  generatedAt: string;
  /** Localized journey title, description, and hashtags for each supported locale: ko-KR, en-US, ja-JP, zh-CN, es-ES, pt-BR, fr-FR, th-TH, vi-VN */
  entries: PublishedJourneyLocalizationEntryDto[];
  /** Localized cluster impressions for each supported locale: ko-KR, en-US, ja-JP, zh-CN, es-ES, pt-BR, fr-FR, th-TH, vi-VN */
  clusterImpressions: PublishedJourneyClusterLocalizedImpressionsDto[];
}

export interface PublishedJourneyDetailDto {
  /**
   * Public ID for sharing
   * @example "abc123xyz789"
   */
  publicId: string;
  /** Author user ID */
  userId: string;
  /** Public author profile (minimal) */
  author: {
    userId?: string;
    name?: string | null;
    picture?: string | null;
  };
  /** Journey start timestamp (ms) */
  startedAt: number;
  /** Journey end timestamp (ms) */
  endedAt?: number;
  /** Journey-local display context for startedAt. Unknown values are explicit rather than guessed. */
  startedAtLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endedAt. Null when endedAt itself is absent. */
  endedAtLocal?: LocalDateTimeContextDto | null;
  /** Journey title */
  title?: string;
  /** Journey description */
  description?: string;
  /** Thumbnail URL for preview. Prefers thumbnail/display variants when available and falls back to the full image URL for legacy rows. */
  thumbnailUrl?: string;
  /** Share URL for web route */
  shareUrl?: string;
  /** Journey mode (photo-only) */
  mode: "PHOTO_ONLY";
  /** Total photo count */
  photoCount: number;
  /** Published image registry keyed by stable photoId for public timeline/media reconstruction */
  images: PublishedJourneyImageDto[];
  /** Clusters for rendering (stops + orphan clusters) */
  clusters: string[];
  /** Timeline blocks for public viewer rendering */
  timeline: {
    clusterId?: string;
    type?: "STOP" | "MOVE" | "ORPHAN";
    time?: PublishedJourneyTimeRangeDto;
    center?: {
      lat?: number;
      lng?: number;
    };
    locationName?: string;
    impression?: string;
    /** Stable published photo IDs referencing top-level images[].photoId */
    photoIds?: string[];
    photos?: PublishedJourneyImageDto[];
  }[];
  /** Export-safe recap draft summary for public rendering */
  recapDraft: {
    timeline?: {
      clusterId?: string;
      type?: "STOP" | "MOVE" | "ORPHAN";
      time?: PublishedJourneyTimeRangeDto;
      center?: {
        lat?: number;
        lng?: number;
      };
      locationName?: string;
      impression?: string;
      /** Stable published photo IDs referencing top-level images[].photoId */
      photoIds?: string[];
      photos?: PublishedJourneyImageDto[];
    }[];
    photoCount?: number;
    imageCount?: number;
  };
  /** Server-generated localized title/description/hashtags and localized cluster impressions. This field is materialized when review reaches APPROVED. */
  localizedContent?: PublishedJourneyLocalizedContentDto;
  /** Up to three representative crawlable images for public web metadata and image sitemap generation */
  seoImages?: PublishedJourneySeoImageDto[];
  /** Published timestamp */
  publishedAt: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp. Public web sitemaps should prefer this for lastmod when present. */
  updatedAt?: string;
  /** Generic review state for this published journey. New documents start as pending until admin approval. */
  review: PublishedJourneyReviewDto;
  /**
   * Content availability status for rendering
   * @example "available"
   */
  contentStatus:
    | "available"
    | "reported_hidden"
    | "review_pending"
    | "review_rejected";
  /**
   * Visibility stored in DB
   * @example "public"
   */
  visibility: "public" | "hidden";
  /**
   * Notice for moderated/hidden content
   * @example "This journey has been reported and is currently hidden."
   */
  notice?: string;
}

export interface PublishedJourneyDetailResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedJourneyDetailDto;
}

export interface PublishedPhotoJourneyContextDto {
  /**
   * Public journey ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /** Author user ID */
  userId: string;
  /**
   * Journey ID
   * @example "journey_123"
   */
  journeyId: string;
  /** Journey start timestamp (ms) */
  startedAt: number;
  /** Journey end timestamp (ms) */
  endedAt?: number;
  /** Journey-local display context for startedAt. Unknown values are explicit rather than guessed. */
  startedAtLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endedAt. Null when endedAt itself is absent. */
  endedAtLocal?: LocalDateTimeContextDto | null;
  /** Localized parent journey metadata when available */
  metadata?: Record<string, any>;
}

export interface PublishedPhotoDto {
  /**
   * Stable published photo identifier for public timeline/media reconstruction
   * @example "external-photo-1"
   */
  photoId: string;
  /**
   * Legacy public URL of the published full-size image asset. Kept as an alias of fullUrl for existing clients.
   * @example "https://cdn.momentbook.app/journeys/user123/1234567890-abc.jpg"
   */
  url: string;
  /**
   * Public URL of the original full-size published image asset
   * @example "https://cdn.momentbook.app/journeys/user123/1234567890-abc.jpg"
   */
  fullUrl: string;
  /**
   * Public URL of the display variant. Falls back to fullUrl.
   * @example "https://cdn.momentbook.app/journeys/user123/variants/1234567890-abc.display.webp"
   */
  displayUrl: string;
  /**
   * Public URL of the thumbnail variant. Falls back to fullUrl.
   * @example "https://cdn.momentbook.app/journeys/user123/variants/1234567890-abc.thumbnail.webp"
   */
  thumbnailUrl: string;
  /**
   * Image width in pixels
   * @example 1080
   */
  width?: number;
  /**
   * Image height in pixels
   * @example 1920
   */
  height?: number;
  /** Photo captured time (ms) */
  takenAt?: number;
  /** Optional location coordinates kept for public image parity */
  location?: JourneyImageLocationDto;
  /** Optional human-friendly location label */
  locationName?: string;
  /** Original capture local-time context preserved from ingest. Unknown values are explicit rather than guessed. */
  captureTime?: CaptureTimeContextDto;
  /** Parent journey context for this published photo */
  journey: PublishedPhotoJourneyContextDto;
}

export interface PublishedPhotoResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedPhotoDto;
}

export interface JourneyAccountSummaryDto {
  /**
   * Account user ID
   * @example "507f1f77bcf86cd799439011"
   */
  userId: string;
  /**
   * Account display name fallback
   * @example "John Doe"
   */
  name?: string | null;
  /**
   * Account profile image
   * @example "https://cdn.momentbook.app/avatars/user123.jpg"
   */
  picture?: string | null;
  /**
   * Raw email when it belongs to the currently authenticated account. Published-owner summaries omit this field for privacy.
   * @example "user@example.com"
   */
  email?: object | null;
  /**
   * Masked email hint for owner-mismatch UX. Null when email is unavailable.
   * @example "u***@example.com"
   */
  emailMasked?: object | null;
  /** Authentication provider */
  provider?: "google" | "apple" | "toss" | "email" | "anonymous" | null;
}

export interface UnpublishOwnershipPrecheckDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Whether the current authenticated account owns this journey
   * @example false
   */
  isOwner: boolean;
  /** Published-account summary for owner mismatch UX. Email is masked instead of exposed raw. */
  publishedBy: JourneyAccountSummaryDto;
  /** Current authenticated account summary */
  currentAccount: JourneyAccountSummaryDto;
}

export interface UnpublishOwnershipPrecheckResponseDto {
  /** @example "success" */
  status: string;
  data: UnpublishOwnershipPrecheckDataDto;
}

export interface UnpublishJourneyResponseDto {
  /** @example "success" */
  status: string;
  /** Unpublish result data */
  data: {
    /** The public ID of the unpublished journey */
    publicId?: string;
    /** Number of S3 images deleted */
    deletedImages?: number;
  };
}

export interface AdminPublishedJourneyItemDto {
  /**
   * Public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Journey ID
   * @example "journey_123"
   */
  journeyId: string;
  /** Author user ID */
  userId: string;
  /** Journey start timestamp (ms) */
  startedAt: number;
  /** Journey end timestamp (ms) */
  endedAt?: number;
  /** Journey-local display context for startedAt. Unknown values are explicit rather than guessed. */
  startedAtLocal: LocalDateTimeContextDto;
  /** Journey-local display context for endedAt. Null when endedAt itself is absent. */
  endedAtLocal?: LocalDateTimeContextDto | null;
  /**
   * Recap stage at publish time. FINALIZED means recap is completed for BI/analytics.
   * @example "FINALIZED"
   */
  recapStage: "NONE" | "FINALIZED";
  /** Number of published photos */
  photoCount: number;
  /**
   * Number of images (deprecated, use photoCount)
   * @deprecated
   */
  imageCount: number;
  /** Preview image URL. Prefers thumbnail/display variants when available and falls back to the full image URL for legacy rows. */
  thumbnailUrl?: string;
  /** Up to three representative crawlable images for public web metadata and image sitemap generation */
  seoImages?: PublishedJourneySeoImageDto[];
  /** Journey metadata */
  metadata?: object;
  /** Published timestamp */
  publishedAt: string;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp. Public web sitemaps should prefer this for lastmod when present. */
  updatedAt?: string;
  /** Current canonical review state for this published journey */
  review: PublishedJourneyReviewDto;
  /**
   * Stored moderation visibility flag
   * @example "public"
   */
  visibility: "public" | "hidden";
  /**
   * Content availability status for rendering
   * @example "available"
   */
  contentStatus:
    | "available"
    | "reported_hidden"
    | "review_pending"
    | "review_rejected";
  /**
   * Whether this record is currently in an active published state.
   * @example true
   */
  published: boolean;
}

export interface AdminPublishedJourneysDataDto {
  /** Admin paginated list of published journey records */
  journeys: AdminPublishedJourneyItemDto[];
  /** Total number of published journey records */
  total: number;
  /** Current page number */
  page: number;
  /** Total number of pages */
  pages: number;
  /** Items per page limit */
  limit: number;
  /**
   * Whether additional admin pages remain after this batch
   * @example true
   */
  hasMore: boolean;
}

export interface AdminPublishedJourneysResponseDto {
  /** @example "success" */
  status: string;
  data: AdminPublishedJourneysDataDto;
}

export interface AdminPublishedJourneyDetailResponseDto {
  /** @example "success" */
  status: string;
  /** Admin-only published journey detail payload. Unlike public detail surfaces, this remains full even when the record is pending review, rejected, or hidden. */
  data: PublishedJourneyDetailDto;
}

export interface UpdatePublishedJourneyReviewRequestDto {
  /**
   * Canonical review status to assign. Admins can move a published journey between review states.
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface UpdatePublishedJourneyReviewDataDto {
  /**
   * Public ID of the published journey
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Canonical journey ID
   * @example "journey_123"
   */
  journeyId: string;
  /**
   * Whether the published record is still in a published state
   * @example true
   */
  published: boolean;
  /**
   * Stored moderation visibility flag
   * @example "public"
   */
  visibility: "public" | "hidden";
  /** Updated canonical review state */
  review: PublishedJourneyReviewDto;
  /**
   * Last updated timestamp after the review mutation
   * @example "2026-04-03T12:34:56.000Z"
   */
  updatedAt: string;
}

export interface UpdatePublishedJourneyReviewResponseDto {
  /** @example "success" */
  status: string;
  data: UpdatePublishedJourneyReviewDataDto;
}

export interface RecordJourneyViewDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Whether the view event was recorded
   * @example true
   */
  recorded: boolean;
}

export interface RecordJourneyViewResponseDto {
  /** @example "success" */
  status: string;
  data: RecordJourneyViewDataDto;
}

export interface PublishedJourneyEngagementDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Active like count
   * @example 12
   */
  likeCount: number;
  /**
   * Active comment count visible to the current viewer. When optional auth is present, comments from blocked users are excluded.
   * @example 4
   */
  commentCount: number;
  /**
   * Whether the authenticated viewer has liked this journey
   * @example true
   */
  liked: boolean;
}

export interface PublishedJourneyEngagementResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedJourneyEngagementDataDto;
}

export interface LikePublishedJourneyDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /**
   * Whether the current viewer now likes the journey
   * @example true
   */
  liked: boolean;
  /**
   * Current active like count
   * @example 13
   */
  likeCount: number;
}

export interface LikePublishedJourneyResponseDto {
  /** @example "success" */
  status: string;
  data: LikePublishedJourneyDataDto;
}

export interface PublishedJourneyCommentAuthorDto {
  /**
   * Comment author user ID
   * @example "507f1f77bcf86cd799439011"
   */
  userId: string;
  /**
   * Comment author display name
   * @example "Moment Booker"
   */
  name: string;
  /**
   * Comment author profile image
   * @example "https://cdn.momentbook.app/avatars/user123.jpg"
   */
  picture?: string | null;
}

export interface PublishedJourneyCommentItemDto {
  /**
   * Comment ID
   * @example "680657032be53a7892fe5abc"
   */
  commentId: string;
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /** Comment author summary */
  author: PublishedJourneyCommentAuthorDto;
  /**
   * Normalized comment body
   * @example "사진 구성이 정말 좋네요."
   */
  body: string;
  /**
   * Whether the authenticated viewer can delete this comment. True for the comment author and the journey owner.
   * @example false
   */
  canDelete: boolean;
  /**
   * Whether the comment was written by the authenticated viewer
   * @example false
   */
  mine: boolean;
  /**
   * Comment creation time
   * @example "2026-04-14T12:00:00.000Z"
   */
  createdAt: string;
}

export interface PublishedJourneyCommentsDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /** Paginated visible comments */
  comments: PublishedJourneyCommentItemDto[];
  /**
   * Total visible comments for the current viewer
   * @example 4
   */
  total: number;
  /**
   * Current page number
   * @example 1
   */
  page: number;
  /**
   * Total number of pages
   * @example 1
   */
  pages: number;
  /**
   * Page size
   * @example 20
   */
  limit: number;
  /**
   * Whether there are more comments after this page
   * @example false
   */
  hasMore: boolean;
}

export interface PublishedJourneyCommentsResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedJourneyCommentsDataDto;
}

export interface CreatePublishedJourneyCommentDto {
  /**
   * Flat comment body
   * @maxLength 1000
   * @example "사진 구성이 정말 좋네요."
   */
  body: string;
}

export interface CreatePublishedJourneyCommentDataDto {
  /** Created comment */
  comment: PublishedJourneyCommentItemDto;
}

export interface CreatePublishedJourneyCommentResponseDto {
  /** @example "success" */
  status: string;
  data: CreatePublishedJourneyCommentDataDto;
}

export interface DeletePublishedJourneyCommentDataDto {
  /**
   * Deleted comment ID
   * @example "680657032be53a7892fe5abc"
   */
  commentId: string;
}

export interface DeletePublishedJourneyCommentResponseDto {
  /** @example "success" */
  status: string;
  data: DeletePublishedJourneyCommentDataDto;
}

export interface PublishedJourneyAnalyticsSummaryDto {
  /**
   * Country-aggregated recorded view count
   * @example 42
   */
  viewCount: number;
  /**
   * Current active like count
   * @example 12
   */
  likeCount: number;
  /**
   * Current active comment count
   * @example 4
   */
  commentCount: number;
}

export interface JourneyInteractionCountryCountDto {
  /**
   * ISO 3166-1 alpha-2 country code
   * @example "KR"
   */
  countryCode: string;
  /**
   * Count attributed to the country bucket
   * @example 12
   */
  count: number;
}

export interface JourneyInteractionCountryBreakdownDto {
  /** Countries that met the disclosure threshold and can be shown directly */
  countries: JourneyInteractionCountryCountDto[];
  /**
   * Count withheld because the individual country bucket was below the disclosure threshold
   * @example 2
   */
  withheldCount: number;
  /**
   * Count recorded without a trusted country resolution signal and therefore grouped as unknown
   * @example 1
   */
  unknownCount: number;
  /**
   * Threshold used for direct country disclosure
   * @example 3
   */
  disclosureThreshold: number;
}

export interface PublishedJourneyAnalyticsGeographyDto {
  /** Country breakdown for recorded views */
  views: JourneyInteractionCountryBreakdownDto;
  /** Country breakdown for active likes */
  likes: JourneyInteractionCountryBreakdownDto;
  /** Country breakdown for active comments */
  comments: JourneyInteractionCountryBreakdownDto;
}

export interface PublishedJourneyAnalyticsDataDto {
  /**
   * Published journey public ID
   * @example "abc123xyz789"
   */
  publicId: string;
  /** Summary counts for the journey */
  summary: PublishedJourneyAnalyticsSummaryDto;
  /** Country-level creator analytics by interaction type */
  geography: PublishedJourneyAnalyticsGeographyDto;
}

export interface PublishedJourneyAnalyticsResponseDto {
  /** @example "success" */
  status: string;
  data: PublishedJourneyAnalyticsDataDto;
}

export interface RegisterFcmTokenDto {
  /**
   * FCM device token
   * @example "dXNlckBleGFtcGxlLmNvbQ:APA91bH..."
   */
  fcmToken: string;
}

export interface UpdateNotificationSettingsDto {
  /**
   * Enable or disable push notifications
   * @example true
   */
  notificationEnabled: boolean;
}

export interface CreateReportDto {
  /**
   * 신고 대상 타입
   * @example "published_journey"
   */
  targetType: "user" | "published_journey";
  /**
   * 신고 대상 ID (`targetType=user`면 userId, `targetType=published_journey`면 publicId)
   * @example "public_q83znM2ap"
   */
  targetId: string;
  /**
   * 신고 사유
   * @example "spam"
   */
  reason: "spam" | "abuse" | "hate" | "sexual" | "inappropriate" | "other";
  /**
   * 기타 사유 상세 설명 (reason이 other인 경우 필수)
   * @example "광고성 게시물입니다"
   */
  description?: string | null;
}

export interface ReportDataDto {
  /**
   * 신고 ID
   * @example "680657032be53a7892fe5abc"
   */
  _id: string;
  /**
   * 신고 대상 타입
   * @example "published_journey"
   */
  targetType: "user" | "published_journey";
  /**
   * 신고 대상 ID (`targetType=user`면 userId, `targetType=published_journey`면 publicId)
   * @example "public_q83znM2ap"
   */
  targetId: string;
  /**
   * 신고 사유
   * @example "spam"
   */
  reason: "spam" | "abuse" | "hate" | "sexual" | "inappropriate" | "other";
  /**
   * 신고 처리 상태
   * @example "pending"
   */
  status: "pending" | "reviewed" | "resolved" | "rejected";
  /**
   * 신고 생성 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  createdAt: string;
}

export interface CreateReportResponseDto {
  /**
   * 상태
   * @example "success"
   */
  status: string;
  /**
   * 메시지
   * @example "신고가 접수되었습니다. 검토 후 적절한 조치를 취하겠습니다."
   */
  message: string;
  /** 생성된 신고 데이터 */
  data: ReportDataDto;
}

export interface AdminReportUserSummaryDto {
  /**
   * 사용자 ID
   * @example "680657032be53a7892fe5ghi"
   */
  userId: string;
  /**
   * 사용자 이름
   * @example "Alice"
   */
  name?: object | null;
  /**
   * 사용자 이메일
   * @example "alice@example.com"
   */
  email?: object | null;
  /**
   * 프로필 이미지 URL
   * @example "https://cdn.example.com/profile/alice.jpg"
   */
  picture?: object | null;
  /**
   * 현재 사용자 상태
   * @example "active"
   */
  status?: "active" | "inactive" | "deleted" | "banned" | null;
}

export interface AdminReportJourneyReviewDto {
  /**
   * 현재 게시글 review 상태
   * @example "APPROVED"
   */
  status: "PENDING" | "APPROVED" | "REJECTED";
  /**
   * 현재 review가 공개 승인 상태인지 여부
   * @example true
   */
  approved: boolean;
}

export interface AdminReportPublishedJourneySummaryDto {
  /**
   * 공개 게시글 publicId
   * @example "public_q83znM2ap"
   */
  publicId: string;
  /**
   * 원본 journey ID
   * @example "36a2d200-74d1-43ed-9265-8626b0eb2881"
   */
  journeyId: string;
  /**
   * 게시글 작성자 사용자 ID
   * @example "680657032be53a7892fe5ghi"
   */
  userId: string;
  /**
   * 현재 active published 상태 여부
   * @example true
   */
  published: boolean;
  /**
   * 현재 게시글 visibility
   * @example "hidden"
   */
  visibility: "public" | "hidden";
  /** 현재 게시글 review 상태 */
  review: AdminReportJourneyReviewDto;
  /**
   * 게시 시각
   * @example "2026-04-10T08:00:00.000Z"
   */
  publishedAt?: object | null;
  /** 게시글 작성자 요약 정보 */
  owner?: AdminReportUserSummaryDto | null;
}

export interface AdminReportTargetCountsDto {
  /**
   * 동일 target에 대한 전체 신고 수
   * @example 4
   */
  totalReports: number;
  /**
   * 동일 target에 대한 유효 신고 수 (`rejected` 제외)
   * @example 3
   */
  effectiveReports: number;
}

export interface AdminReportItemDto {
  /**
   * 신고 ID
   * @example "680657032be53a7892fe5abc"
   */
  _id: string;
  /**
   * 신고한 사용자 ID
   * @example "680657032be53a7892fe5ghi"
   */
  reporterId: string;
  /**
   * 신고 대상 타입
   * @example "published_journey"
   */
  targetType: "user" | "published_journey";
  /**
   * 신고 대상 ID (`targetType=user`면 userId, `targetType=published_journey`면 publicId)
   * @example "public_q83znM2ap"
   */
  targetId: string;
  /**
   * 신고 사유
   * @example "spam"
   */
  reason: "spam" | "abuse" | "hate" | "sexual" | "inappropriate" | "other";
  /**
   * 신고 상세 설명
   * @example "광고성 게시물입니다"
   */
  description?: object | null;
  /**
   * 신고 처리 상태
   * @example "pending"
   */
  status: "pending" | "reviewed" | "resolved" | "rejected";
  /**
   * 관리자 메모
   * @example "검토 중입니다"
   */
  adminNote?: object | null;
  /**
   * 처리 완료 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  resolvedAt?: object | null;
  /**
   * 처리한 관리자 ID
   * @example "680657032be53a7892fe5jkl"
   */
  resolvedBy?: object | null;
  /**
   * 신고 생성 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /**
   * 신고 수정 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  updatedAt: string;
  /** 신고자 요약 정보 */
  reporter?: AdminReportUserSummaryDto | null;
  /** 신고 대상이 사용자일 때의 대상 사용자 요약 정보. `targetType=user`가 아니면 `null`입니다. */
  targetUser?: AdminReportUserSummaryDto | null;
  /** 신고 대상이 게시글일 때의 대상 게시글 요약 정보. `targetType=published_journey`가 아니면 `null`입니다. */
  targetPublishedJourney?: AdminReportPublishedJourneySummaryDto | null;
  /** 동일 target에 대한 신고 집계 정보 */
  targetReportCounts: AdminReportTargetCountsDto;
}

export interface AdminReportsDataDto {
  /** 관리자용 paginated report 목록 */
  reports: AdminReportItemDto[];
  /**
   * 전체 신고 수
   * @example 18
   */
  total: number;
  /**
   * 현재 페이지 번호
   * @example 1
   */
  page: number;
  /**
   * 전체 페이지 수
   * @example 1
   */
  pages: number;
  /**
   * 페이지당 항목 수
   * @example 20
   */
  limit: number;
  /**
   * 다음 페이지 존재 여부
   * @example false
   */
  hasMore: boolean;
}

export interface AdminReportsResponseDto {
  /**
   * 상태
   * @example "success"
   */
  status: string;
  /** 관리자용 paginated report 목록 */
  data: AdminReportsDataDto;
}

export interface AdminReportTargetTypeStatsDto {
  /**
   * 사용자 대상 신고 문서 수
   * @example 3
   */
  userReports: number;
  /**
   * 게시글 대상 신고 문서 수
   * @example 7
   */
  publishedJourneyReports: number;
}

export interface AdminReportStatsDataDto {
  /**
   * 전체 신고 문서 수
   * @example 10
   */
  totalReports: number;
  /**
   * 열린 신고 수 (`pending + reviewed`)
   * @example 4
   */
  openReports: number;
  /**
   * 대기 중인 신고 수
   * @example 3
   */
  pendingReports: number;
  /**
   * 검토 중인 신고 수
   * @example 1
   */
  reviewedReports: number;
  /**
   * 해결된 신고 수
   * @example 5
   */
  resolvedReports: number;
  /**
   * 거부된 신고 수
   * @example 1
   */
  rejectedReports: number;
  /** targetType별 신고 문서 수 */
  byTargetType: AdminReportTargetTypeStatsDto;
}

export interface AdminReportStatsResponseDto {
  /**
   * 상태
   * @example "success"
   */
  status: string;
  /** 관리자용 report 통계 데이터 */
  data: AdminReportStatsDataDto;
}

export interface AdminReportDetailDataDto {
  /**
   * 신고 ID
   * @example "680657032be53a7892fe5abc"
   */
  _id: string;
  /**
   * 신고한 사용자 ID
   * @example "680657032be53a7892fe5ghi"
   */
  reporterId: string;
  /**
   * 신고 대상 타입
   * @example "published_journey"
   */
  targetType: "user" | "published_journey";
  /**
   * 신고 대상 ID (`targetType=user`면 userId, `targetType=published_journey`면 publicId)
   * @example "public_q83znM2ap"
   */
  targetId: string;
  /**
   * 신고 사유
   * @example "spam"
   */
  reason: "spam" | "abuse" | "hate" | "sexual" | "inappropriate" | "other";
  /**
   * 신고 상세 설명
   * @example "광고성 게시물입니다"
   */
  description?: object | null;
  /**
   * 신고 처리 상태
   * @example "pending"
   */
  status: "pending" | "reviewed" | "resolved" | "rejected";
  /**
   * 관리자 메모
   * @example "검토 중입니다"
   */
  adminNote?: object | null;
  /**
   * 처리 완료 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  resolvedAt?: object | null;
  /**
   * 처리한 관리자 ID
   * @example "680657032be53a7892fe5jkl"
   */
  resolvedBy?: object | null;
  /**
   * 신고 생성 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  createdAt: string;
  /**
   * 신고 수정 시간
   * @example "2023-01-01T00:00:00.000Z"
   */
  updatedAt: string;
  /** 신고자 요약 정보 */
  reporter?: AdminReportUserSummaryDto | null;
  /** 신고 대상이 사용자일 때의 대상 사용자 요약 정보. `targetType=user`가 아니면 `null`입니다. */
  targetUser?: AdminReportUserSummaryDto | null;
  /** 신고 대상이 게시글일 때의 대상 게시글 요약 정보. `targetType=published_journey`가 아니면 `null`입니다. */
  targetPublishedJourney?: AdminReportPublishedJourneySummaryDto | null;
  /** 동일 target에 대한 신고 집계 정보 */
  targetReportCounts: AdminReportTargetCountsDto;
}

export interface AdminReportDetailResponseDto {
  /**
   * 상태
   * @example "success"
   */
  status: string;
  /** 관리자용 report 상세 데이터 */
  data: AdminReportDetailDataDto;
}

export interface UpdateAdminReportDto {
  /**
   * 새 신고 처리 상태
   * @example "reviewed"
   */
  status?: "pending" | "reviewed" | "resolved" | "rejected";
  /**
   * 관리자 메모. `null` 또는 빈 문자열로 보내면 기존 메모를 비웁니다.
   * @maxLength 1000
   * @example "유사 신고들과 함께 묶어 검토 중입니다."
   */
  adminNote?: object | null;
}

export interface AdminReportMutationResponseDto {
  /**
   * 상태
   * @example "success"
   */
  status: string;
  /** 업데이트된 관리자용 report 상세 데이터 */
  data: AdminReportDetailDataDto;
}

export interface JourneyRecapInputDto {
  /** @example "journey_abc123" */
  id: string;
  /**
   * Unix ms timestamp
   * @example 1704067200000
   */
  startedAt: number;
  /**
   * Unix ms timestamp
   * @example 1704070800000
   */
  endedAt?: number;
  /** Optional local-time context for the journey start. Use unknown/null rather than guessing when the local context cannot be determined. */
  startedAtLocal?: LocalDateTimeContextDto;
  /** Optional local-time context for the journey end. Use unknown/null rather than guessing when the local context cannot be determined. */
  endedAtLocal?: LocalDateTimeContextDto;
}

export interface PhotoMetaInputDto {
  /**
   * Client-side photo identifier
   * @example "file:///photos/IMG_0001.jpg"
   */
  uri: string;
  /**
   * Unix ms timestamp
   * @example 1704067210000
   */
  takenAt: number;
  /**
   * @min -90
   * @max 90
   * @example 37.5665
   */
  lat?: number;
  /**
   * @min -180
   * @max 180
   * @example 126.978
   */
  lng?: number;
  /** @example true */
  hasGps: boolean;
  /** @example 4032 */
  width?: number;
  /** @example 3024 */
  height?: number;
  /** Optional original capture local-time context. Use this to preserve explicit offsets, IANA zones, or floating local wall-clock values from ingest. */
  captureTime?: CaptureTimeContextDto;
}

export interface CreateJourneyRecapDraftRequestDto {
  journey: JourneyRecapInputDto;
  photos: PhotoMetaInputDto[];
}

export interface JourneyRecapDraftResponseDataDto {
  /** Export-safe recap draft payload */
  recapDraft: JourneyRecapExportDraftDto;
}

export interface JourneyRecapDraftResponseDto {
  /** @example "success" */
  status: string;
  data: JourneyRecapDraftResponseDataDto;
}

export interface JourneyRecapDraftCorrectionOptionsDto {
  /**
   * Spatial outlier threshold multiplier on cluster radius (default: 2.0)
   * @example 2
   */
  spatialOutlierRadiusMultiplier?: number;
  /**
   * Absolute max distance (meters) for outlier detection (default: 500)
   * @example 500
   */
  spatialOutlierAbsoluteMaxM?: number;
  /**
   * Minimum temporal score improvement to reassign a photo (default: 0.3)
   * @example 0.3
   */
  minTemporalImprovement?: number;
  /**
   * Maximum temporal gap (ms) for temporal affinity matching (default: 45 minutes)
   * @example 2700000
   */
  maxTemporalGapMs?: number;
  /**
   * Cluster photo count threshold (<=) to treat as small cluster (default: 2)
   * @example 2
   */
  smallClusterThreshold?: number;
  /**
   * Minimum temporal score to mark small-cluster photo as outlier candidate (default: 0.7)
   * @example 0.7
   */
  smallClusterTemporalThreshold?: number;
  /**
   * Temporal window (ms) to count nearby photos in target cluster (default: 15 minutes)
   * @example 900000
   */
  densityWindowMs?: number;
  /**
   * Minimum nearby photos in target cluster to allow reassignment (default: 1)
   * @example 1
   */
  minNearbyPhotos?: number;
}

export interface CorrectJourneyRecapDraftRequestDto {
  /** Export-safe recap draft payload from /v2/journeys/recap/draft response */
  recapDraft: JourneyRecapExportDraftDto;
  /** Optional correction tuning parameters */
  options?: JourneyRecapDraftCorrectionOptionsDto;
}

export interface JourneyRecapDraftCorrectionStatsDto {
  /** @example 82 */
  totalPhotosAnalyzed: number;
  /** @example 4 */
  outlierCandidatesDetected: number;
  /**
   * Deprecated alias of outlierCandidatesDetected for backward compatibility
   * @deprecated
   * @example 4
   */
  spatialOutliersDetected?: number;
  /** @example 2 */
  photosReassigned: number;
  /** @example 3 */
  clustersAffected: number;
  /** @example 1 */
  emptyClustersPruned: number;
}

export interface JourneyRecapDraftCorrectionSummaryDto {
  /**
   * Whether at least one photo was reassigned
   * @example true
   */
  applied: boolean;
  stats: JourneyRecapDraftCorrectionStatsDto;
}

export interface JourneyRecapCorrectedDraftResponseDataDto {
  /** Export-safe recap draft payload after GPS outlier correction */
  recapDraft: JourneyRecapExportDraftDto;
  correction: JourneyRecapDraftCorrectionSummaryDto;
}

export interface JourneyRecapCorrectedDraftResponseDto {
  /** @example "success" */
  status: string;
  data: JourneyRecapCorrectedDraftResponseDataDto;
}

export interface PresignUploadRequestDto {
  /**
   * Journey ID to associate the upload with (client-generated UUID)
   * @example "36a2d200-74d1-43ed-9265-8626b0eb2881"
   */
  journeyId: string;
  /**
   * Content type of the file
   * @example "image/jpeg"
   */
  contentType: "image/jpeg" | "image/png" | "image/webp";
  /**
   * File extension
   * @example "jpg"
   */
  fileExt?: string;
  /**
   * File size in bytes (max 5MB)
   * @example 1048576
   */
  sizeBytes?: number;
  /**
   * Purpose of the upload
   * @example "journey"
   */
  purpose: "journey";
}

export interface PresignUploadDataDto {
  /** Presigned URL for uploading the file */
  uploadUrl: string;
  /** Canonical public asset URL to access the uploaded file after upload completes */
  downloadUrl: string;
  /** S3 object key */
  key: string;
}

export interface PresignUploadResponseDto {
  /**
   * Status of the request
   * @example "success"
   */
  status: string;
  /** Presigned URL data */
  data: PresignUploadDataDto;
}

export interface BatchPresignUploadAssetRequestDto {
  /**
   * Client-side stable reference used to map the response to the source asset
   * @maxLength 128
   * @example "local-photo-1"
   */
  clientRef: string;
  /**
   * Journey ID to associate the upload with (client-generated UUID)
   * @example "36a2d200-74d1-43ed-9265-8626b0eb2881"
   */
  journeyId: string;
  /**
   * Purpose of the upload
   * @example "journey"
   */
  purpose: "journey";
  /**
   * Content type of the file
   * @example "image/jpeg"
   */
  contentType: "image/jpeg" | "image/png" | "image/webp";
  /**
   * File size in bytes (max 5MB)
   * @example 1048576
   */
  sizeBytes: number;
}

export interface BatchPresignUploadRequestDto {
  /**
   * Assets to presign. The server validates the whole batch before generating any URLs.
   * @maxItems 100
   * @minItems 1
   */
  assets: BatchPresignUploadAssetRequestDto[];
}

export interface BatchPresignUploadAssetResponseDto {
  /** Presigned URL for uploading the file */
  uploadUrl: string;
  /** Canonical public asset URL to access the uploaded file after upload completes */
  downloadUrl: string;
  /** S3 object key */
  key: string;
  /**
   * Client-side stable reference echoed from the request item
   * @example "local-photo-1"
   */
  clientRef: string;
  /**
   * Presigned URL lifetime in seconds
   * @example 3600
   */
  expiresInSeconds: number;
  /**
   * Approximate presigned URL expiration timestamp
   * @example "2026-06-13T12:00:00.000Z"
   */
  expiresAt: string;
}

export interface BatchPresignUploadDataDto {
  /** Presigned URL data in the same order as the request assets */
  assets: BatchPresignUploadAssetResponseDto[];
}

export interface BatchPresignUploadResponseDto {
  /**
   * Status of the request
   * @example "success"
   */
  status: string;
  /** Batch presigned URL data */
  data: BatchPresignUploadDataDto;
}

export interface VersionCheckDataDto {
  /** @example "ios" */
  platform: "ios" | "android";
  /** @example "1.8.4" */
  clientVersion: string;
  /** @example "2.0.0" */
  minSupportedVersion: string;
  /** @example "2.1.3" */
  latestVersion?: string;
  /** @example "force" */
  updateMode: "force" | "soft" | "none";
  /** @example "https://apps.apple.com/app/idXXXX" */
  storeUrl?: string;
  /** @example true */
  shouldUpdate: boolean;
  /** @example true */
  shouldForceUpdate: boolean;
  /** @example "BELOW_MIN_SUPPORTED" */
  reason: "BELOW_MIN_SUPPORTED" | "BELOW_LATEST" | "UP_TO_DATE" | "MODE_NONE";
  /** @example 1700000000000 */
  ts: number;
}

export interface VersionCheckResponseDto {
  /** @example "success" */
  status: string;
  /** @example "Version check completed" */
  message: string;
  data: VersionCheckDataDto;
}

export interface ArticleCoverImageDto {
  /**
   * First embedded image derived from the markdown body
   * @example "https://images.example.com/rio-carnival.jpg"
   */
  url: string;
  /**
   * Alt text from the first embedded markdown image
   * @example "Dancers in costume at a carnival parade"
   */
  alt: string;
}

export interface PublicArticleListItemDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /** @example "en-US" */
  locale: string;
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /** @example "Rio Carnival 2026 Guide" */
  title: string;
  /** @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context." */
  summary: string;
  coverImage?: ArticleCoverImageDto;
  /**
   * Estimated reading time in minutes
   * @example 6
   */
  readingTimeMinutes: number;
  /** @example "MomentBook Editorial" */
  authorName: string;
  /** @example "2026-04-06T07:30:00.000Z" */
  publishedAt: string;
  /** @example "2026-04-06T07:30:00.000Z" */
  updatedAt: string;
}

export interface PublicArticlesDataDto {
  articles: PublicArticleListItemDto[];
  /** @example 42 */
  total: number;
  /** @example 1 */
  page: number;
  /** @example 4 */
  pages: number;
  /** @example 12 */
  limit: number;
  /** @example true */
  hasMore: boolean;
}

export interface PublicArticlesResponseDto {
  /** @example "success" */
  status: string;
  data: PublicArticlesDataDto;
}

export interface ArticleAlternateDto {
  /** @example "ko" */
  language: string;
  /** @example "ko-KR" */
  locale: string;
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /**
   * Localized article title for the alternate
   * @example "2026 리우 카니발 가이드"
   */
  title: string;
}

export interface PublicArticleDetailDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example "artgrp_huSNo8J2kf4t" */
  translationGroupId: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /** @example "en-US" */
  locale: string;
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /** @example "Rio Carnival 2026 Guide" */
  title: string;
  /** @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context." */
  summary: string;
  /**
   * Main article body rendered as markdown. Embedded images use markdown image syntax.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
  coverImage?: ArticleCoverImageDto;
  /** @example 6 */
  readingTimeMinutes: number;
  /** @example "MomentBook Editorial" */
  authorName: string;
  /** Sibling translations available for hreflang links */
  alternates: ArticleAlternateDto[];
  /** @example "2026-04-06T07:30:00.000Z" */
  publishedAt: string;
  /** @example "2026-04-06T08:10:00.000Z" */
  updatedAt: string;
}

export interface PublicArticleDetailResponseDto {
  /** @example "success" */
  status: string;
  data: PublicArticleDetailDto;
}

export interface AdminArticleListItemDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /** @example "en-US" */
  locale: string;
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /** @example "Rio Carnival 2026 Guide" */
  title: string;
  /** @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context." */
  summary: string;
  coverImage?: ArticleCoverImageDto;
  /**
   * Estimated reading time in minutes
   * @example 6
   */
  readingTimeMinutes: number;
  /** @example "MomentBook Editorial" */
  authorName: string;
  /** @example "2026-04-06T07:30:00.000Z" */
  publishedAt: string;
  /** @example "2026-04-06T07:30:00.000Z" */
  updatedAt: string;
  /** @example "artgrp_huSNo8J2kf4t" */
  translationGroupId: string;
}

export interface AdminArticlesDataDto {
  articles: AdminArticleListItemDto[];
  /** @example 12 */
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

export interface AdminArticlesResponseDto {
  /** @example "success" */
  status: string;
  data: AdminArticlesDataDto;
}

export interface AdminArticleDetailDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example "artgrp_huSNo8J2kf4t" */
  translationGroupId: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /** @example "en-US" */
  locale: string;
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /** @example "Rio Carnival 2026 Guide" */
  title: string;
  /** @example "What to know before planning a Rio Carnival trip, from parade timing to official schedules and neighborhood context." */
  summary: string;
  /**
   * Main article body rendered as markdown. Embedded images use markdown image syntax.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
  coverImage?: ArticleCoverImageDto;
  /** @example 6 */
  readingTimeMinutes: number;
  /** @example "MomentBook Editorial" */
  authorName: string;
  /** Sibling translations available for hreflang links */
  alternates: ArticleAlternateDto[];
  /** @example "2026-04-06T07:30:00.000Z" */
  publishedAt: string;
  /** @example "2026-04-06T08:10:00.000Z" */
  updatedAt: string;
}

export interface AdminArticleDetailResponseDto {
  /** @example "success" */
  status: string;
  data: AdminArticleDetailDto;
}

export interface CreateAdminArticleRequestDto {
  /**
   * Optional translation group ID. Leave empty to start a new article group.
   * @example "artgrp_huSNo8J2kf4t"
   */
  translationGroupId?: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /**
   * Optional custom slug. If omitted, the server generates one from the title.
   * @example "rio-carnival-2026-guide"
   */
  slug?: string;
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "Rio Carnival 2026 Guide" */
  title: string;
  /**
   * Markdown body. Embedded images should use standard markdown image syntax with non-empty alt text.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body: string;
}

export interface AdminArticleMutationDataDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example "artgrp_huSNo8J2kf4t" */
  translationGroupId: string;
  /** @example "en" */
  language: "ko" | "en" | "ja" | "zh" | "es" | "pt" | "fr" | "th" | "vi";
  /** @example "wellbeing-guide" */
  category:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "rio-carnival-2026-guide" */
  slug: string;
  /** @example "2026-04-06T07:30:00.000Z" */
  publishedAt: string;
  /** @example "2026-04-06T08:10:00.000Z" */
  updatedAt: string;
}

export interface AdminArticleMutationResponseDto {
  /** @example "success" */
  status: string;
  data: AdminArticleMutationDataDto;
}

export interface UpdateAdminArticleRequestDto {
  /** @example "wellbeing-guide" */
  category?:
    | "festival"
    | "travel-guide"
    | "destination-guide"
    | "wellbeing-guide";
  /** @example "Rio Carnival 2026 Planning Guide" */
  title?: string;
  /**
   * Markdown body. Embedded images should use standard markdown image syntax with non-empty alt text.
   * @example "# Parade planning
   *
   * Start with the official schedule.
   *
   * ![Rio Carnival parade](https://images.example.com/rio-carnival.jpg)
   *
   * Book accommodation early if you want to stay near the Sambadrome."
   */
  body?: string;
}

export interface AdminDeleteArticleDataDto {
  /** @example "67f21f70d3f160c39078e7a3" */
  articleId: string;
  /** @example true */
  deleted: boolean;
}

export interface AdminDeleteArticleResponseDto {
  /** @example "success" */
  status: string;
  data: AdminDeleteArticleDataDto;
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
 * @title MomentBook API
 * @version 2.3.21
 * @contact
 *
 * MomentBook API 문서 - 생각을 공유하고 관리하는 플랫폼
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
     * @description 현재 인증된 사용자의 프로필 정보를 조회합니다. **주요 변경사항 (v1.0.14):** - 필수 동의 미완료 사용자도 프로필 조회 가능 (403 에러 제거) - 응답에 `consents` 필드 추가하여 동의 상태 정보 제공 - 클라이언트는 `consents.requiresAction`을 확인하여 동의 화면으로 네비게이션 **동의 상태 처리:** - `consents.requiresAction: true` → 동의 화면으로 이동 필요 - `consents.requiresAction: false` → 모든 필수 동의 완료
     *
     * @tags users
     * @name UsersControllerGetMyProfile
     * @summary 내 프로필 조회
     * @request GET:/v2/users/profile/me
     * @secure
     */
    usersControllerGetMyProfile: (params: RequestParams = {}) =>
      this.request<UserProfileSuccessResponseDto, void>({
        path: `/v2/users/profile/me`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자의 프로필 정보를 업데이트합니다
     *
     * @tags users
     * @name UsersControllerUpdateMyProfile
     * @summary 내 프로필 업데이트
     * @request PUT:/v2/users/profile/me
     * @secure
     */
    usersControllerUpdateMyProfile: (
      data: UpdateUserProfileDto,
      params: RequestParams = {},
    ) =>
      this.request<UserProfileUpdateSuccessResponseDto, void>({
        path: `/v2/users/profile/me`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자의 프로필 정보를 조회합니다. Optional Bearer token이 있으면 authenticated viewer 기준 block 관계를 검사하며, 차단된 대상은 404로 숨깁니다.
     *
     * @tags users
     * @name UsersControllerGetUserById
     * @summary 특정 사용자 정보 조회
     * @request GET:/v2/users/profile/{userId}
     * @secure
     */
    usersControllerGetUserById: (userId: string, params: RequestParams = {}) =>
      this.request<UserProfileSuccessResponseDto, void>({
        path: `/v2/users/profile/${userId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자의 계정을 삭제합니다. **삭제 처리 내용:** - 사용자 상태를 'deleted'로 변경 (실제 데이터는 보관) - FCM 토큰 완전 삭제 및 푸시 알림 비활성화 - 사용자가 동의한 모든 이용약관 정보 완전 삭제 - 개인정보 보호를 위한 동의 기록 삭제 **푸시 알림 관련 처리:** - 등록된 FCM 토큰 삭제 - notificationEnabled 값을 false로 설정 - 향후 푸시 알림 수신 불가 탈퇴 후에는 해당 계정으로 로그인할 수 없으며, 동의 정보는 복구되지 않습니다.
     *
     * @tags users
     * @name UsersControllerDeleteMyAccount
     * @summary 회원 탈퇴
     * @request DELETE:/v2/users/me
     * @secure
     */
    usersControllerDeleteMyAccount: (params: RequestParams = {}) =>
      this.request<BasicSuccessResponseDto, void>({
        path: `/v2/users/me`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자가 팔로우한 사용자 목록을 최신 팔로우순으로 조회합니다. block 관계 또는 비활성/삭제 상태가 된 사용자는 이 목록에서 제외됩니다.
     *
     * @tags users
     * @name UsersControllerGetFollowingUsers
     * @summary 팔로우한 사용자 목록 조회
     * @request GET:/v2/users/follows
     * @secure
     */
    usersControllerGetFollowingUsers: (
      query?: {
        /**
         * 페이지 번호 (default: 1)
         * @example 1
         */
        page?: number;
        /**
         * 페이지당 항목 수 (default: 20)
         * @example 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<FollowingUsersResponseDto, void>({
        path: `/v2/users/follows`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자를 기준으로 특정 대상 사용자의 effective follow state를 조회합니다. block 관계이거나 비활성/삭제 상태이거나 팔로우 대상이 자기 자신이면 `isFollowing=false`를 반환합니다.
     *
     * @tags users
     * @name UsersControllerGetFollowState
     * @summary 사용자 팔로우 상태 조회
     * @request GET:/v2/users/follows/{followingUserId}/state
     * @secure
     */
    usersControllerGetFollowState: (
      followingUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<FollowStateResponseDto, void>({
        path: `/v2/users/follows/${followingUserId}/state`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자를 팔로우합니다. 이미 팔로우 중인 경우에도 현재 상태를 그대로 반환합니다.
     *
     * @tags users
     * @name UsersControllerFollowUser
     * @summary 사용자 팔로우
     * @request POST:/v2/users/follows/{followingUserId}
     * @secure
     */
    usersControllerFollowUser: (
      followingUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<FollowUserResponseDto, void>({
        path: `/v2/users/follows/${followingUserId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자의 팔로우를 해제합니다. 이미 언팔로우된 상태여도 현재 상태를 반환합니다.
     *
     * @tags users
     * @name UsersControllerUnfollowUser
     * @summary 사용자 언팔로우
     * @request DELETE:/v2/users/follows/{followingUserId}
     * @secure
     */
    usersControllerUnfollowUser: (
      followingUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<UnfollowUserResponseDto, void>({
        path: `/v2/users/follows/${followingUserId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자가 차단한 사용자 목록을 최신 차단순으로 조회합니다. 이 엔드포인트는 unblock management surface 용도이며, 차단 정책으로 숨겨진 공개 프로필/여정 조회를 대체하지 않습니다.
     *
     * @tags users
     * @name UsersControllerGetBlockedUsers
     * @summary 차단한 사용자 목록 조회
     * @request GET:/v2/users/blocks
     * @secure
     */
    usersControllerGetBlockedUsers: (
      query?: {
        /**
         * 페이지 번호 (default: 1)
         * @example 1
         */
        page?: number;
        /**
         * 페이지당 항목 수 (default: 20)
         * @example 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<BlockedUsersResponseDto, void>({
        path: `/v2/users/blocks`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자를 차단합니다
     *
     * @tags users
     * @name UsersControllerBlockUser
     * @summary 사용자 차단
     * @request POST:/v2/users/blocks/{blockedUserId}
     * @secure
     */
    usersControllerBlockUser: (
      blockedUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<BlockUserResponseDto, void>({
        path: `/v2/users/blocks/${blockedUserId}`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자의 차단을 해제합니다
     *
     * @tags users
     * @name UsersControllerUnblockUser
     * @summary 사용자 차단 해제
     * @request DELETE:/v2/users/blocks/{blockedUserId}
     * @secure
     */
    usersControllerUnblockUser: (
      blockedUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<UnblockUserResponseDto, void>({
        path: `/v2/users/blocks/${blockedUserId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 현재 인증된 사용자가 직접 차단한 사용자에 대해 unblock management 용 최소 프로필 상세를 조회합니다. public profile/public journey visibility 정책은 우회하지 않으며, 이 엔드포인트는 차단 관계가 있는 대상에 대해서만 name/picture/biography 같은 최소 식별 정보를 반환합니다.
     *
     * @tags users
     * @name UsersControllerGetBlockedUserDetail
     * @summary 차단한 사용자 상세 조회
     * @request GET:/v2/users/blocks/{blockedUserId}/detail
     * @secure
     */
    usersControllerGetBlockedUserDetail: (
      blockedUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<BlockedUserDetailResponseDto, void>({
        path: `/v2/users/blocks/${blockedUserId}/detail`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 특정 사용자의 차단 상태를 조회합니다
     *
     * @tags users
     * @name UsersControllerGetBlockStatus
     * @summary 사용자 차단 상태 조회
     * @request GET:/v2/users/blocks/{blockedUserId}/status
     * @secure
     */
    usersControllerGetBlockStatus: (
      blockedUserId: string,
      params: RequestParams = {},
    ) =>
      this.request<BlockStatusResponseDto, void>({
        path: `/v2/users/blocks/${blockedUserId}/status`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description 회원가입 시 필요한 동의 항목 목록을 조회합니다. 앱은 path를 웹 호스트와 결합하여 사용합니다.
     *
     * @tags consents
     * @name ConsentTemplatesControllerGetSignupConsents
     * @summary 회원가입용 동의 항목 목록 조회
     * @request GET:/v2/consent-templates/signup
     */
    consentTemplatesControllerGetSignupConsents: (params: RequestParams = {}) =>
      this.request<SignupConsentsResponseDto, void>({
        path: `/v2/consent-templates/signup`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description 회원가입 시 사용자가 동의한 항목들을 저장합니다. 필수 항목에 모두 동의하면 사용자가 활성화됩니다.
     *
     * @tags consents
     * @name UserConsentsControllerUpdateUserConsents
     * @summary 사용자 동의 업데이트
     * @request POST:/v2/users/consents
     * @secure
     */
    userConsentsControllerUpdateUserConsents: (
      data: UpdateUserConsentsDto,
      params: RequestParams = {},
    ) =>
      this.request<UpdateUserConsentsResponseDto, void>({
        path: `/v2/users/consents`,
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
     * @name AuthControllerSignInWithGoogle
     * @summary Google OAuth 인증 시작 (웹 브라우저 리다이렉트)
     * @request GET:/v2/auth/google
     */
    authControllerSignInWithGoogle: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/v2/auth/google`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerHandleGoogleCallback
     * @summary Google OAuth Callback
     * @request GET:/v2/auth/google/callback
     */
    authControllerHandleGoogleCallback: (
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
     * @name AuthControllerSignInWithGoogleToken
     * @summary Google Token으로 인증 (모바일/웹)
     * @request POST:/v2/auth/google/token
     */
    authControllerSignInWithGoogleToken: (
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
     * @name AuthControllerSignInWithApple
     * @summary Apple Sign-In 인증
     * @request POST:/v2/auth/apple
     */
    authControllerSignInWithApple: (
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
     * @name AuthControllerSignInWithToss
     * @summary Toss 로그인 (앱인토스 미니앱 / 파트너 앱·웹)
     * @request POST:/v2/auth/toss
     */
    authControllerSignInWithToss: (
      data: TossAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<TossLoginSuccessResponseDto, any>({
        path: `/v2/auth/toss`,
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
     * @name AuthControllerContinueAsGuest
     * @summary 게스트로 계속하기
     * @request POST:/v2/auth/guest
     */
    authControllerContinueAsGuest: (
      data: GuestAuthDto,
      params: RequestParams = {},
    ) =>
      this.request<GuestLoginSuccessResponseDto, any>({
        path: `/v2/auth/guest`,
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
     * @name AuthControllerRefreshToken
     * @summary Access Token 갱신
     * @request POST:/v2/auth/refresh
     */
    authControllerRefreshToken: (
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
     * @name AuthControllerLogout
     * @summary 로그아웃 (단일 디바이스)
     * @request POST:/v2/auth/logout
     */
    authControllerLogout: (data: LogoutDto, params: RequestParams = {}) =>
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
     * @name AuthControllerLogoutAll
     * @summary 모든 디바이스에서 로그아웃
     * @request POST:/v2/auth/logout-all
     * @secure
     */
    authControllerLogoutAll: (params: RequestParams = {}) =>
      this.request<LogoutAllResponseDto, any>({
        path: `/v2/auth/logout-all`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name AuthControllerSendEmailVerificationCode
     * @summary 이메일 인증 코드 발송
     * @request POST:/v2/auth/email/send-verification
     */
    authControllerSendEmailVerificationCode: (
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
     * @name AuthControllerVerifyEmailCode
     * @summary 이메일 인증 코드 확인
     * @request POST:/v2/auth/email/verify-code
     */
    authControllerVerifyEmailCode: (
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
     * @name AuthControllerSignupWithEmail
     * @summary 이메일 회원가입
     * @request POST:/v2/auth/email/signup
     */
    authControllerSignupWithEmail: (
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
     * @name AuthControllerLoginWithEmail
     * @summary 이메일 로그인
     * @request POST:/v2/auth/email/login
     */
    authControllerLoginWithEmail: (
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
     * @name AuthControllerChangePassword
     * @summary 비밀번호 변경
     * @request POST:/v2/auth/email/password
     * @secure
     */
    authControllerChangePassword: (
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
     * @name AuthControllerRequestPasswordReset
     * @summary 비밀번호 재설정 코드 요청
     * @request POST:/v2/auth/email/request-password-reset
     */
    authControllerRequestPasswordReset: (
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
     * @name AuthControllerResetPassword
     * @summary 비밀번호 재설정
     * @request POST:/v2/auth/email/reset-password
     */
    authControllerResetPassword: (
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
     * @name AuthControllerCheckEmail
     * @summary 이메일 존재 여부 확인
     * @request GET:/v2/auth/email/check
     */
    authControllerCheckEmail: (
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

    /**
     * @description Public endpoint to retrieve a paginated list of users who have publicly visible approved journeys. When an optional Bearer token is present, users in a block relationship with the authenticated viewer are suppressed from the result set.
     *
     * @tags users
     * @name PublicUsersControllerGetPublicUsers
     * @summary Get list of public users
     * @request GET:/v2/users/public
     * @secure
     */
    publicUsersControllerGetPublicUsers: (
      query?: {
        /**
         * Page number (default: 1)
         * @example 1
         */
        page?: number;
        /**
         * Number of items per page (default: 20)
         * @example 20
         */
        limit?: number;
        /** Sort order (default: recent) */
        sort?: "recent" | "oldest" | "mostJourneys";
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicUsersResponseDto, any>({
        path: `/v2/users/public`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve user profile data for users who have publicly visible approved journeys. When an optional Bearer token is present and the target user is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags users
     * @name PublicUsersControllerGetPublicUserProfile
     * @summary Get public user profile
     * @request GET:/v2/users/public/{userId}
     * @secure
     */
    publicUsersControllerGetPublicUserProfile: (
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<PublicUserProfileResponseDto, void>({
        path: `/v2/users/public/${userId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve profile memories summary/map data derived only from the target user’s approved public journeys. When an optional Bearer token is present and the target user is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags users
     * @name PublicUsersControllerGetPublicUserMemoriesOverview
     * @summary Get public memories overview for a specific user
     * @request GET:/v2/users/public/{userId}/memories/overview
     * @secure
     */
    publicUsersControllerGetPublicUserMemoriesOverview: (
      userId: string,
      params: RequestParams = {},
    ) =>
      this.request<PublicMemoriesOverviewResponseDto, void>({
        path: `/v2/users/public/${userId}/memories/overview`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve a paginated list of approved public journeys by a specific user. Use `continent` for continent-wide browsing, or `continent + regionId` for a specific region returned by /v2/users/public/:userId/memories/overview. When an optional Bearer token is present and the target user is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags users
     * @name PublicUsersControllerGetPublicUserJourneys
     * @summary Get published journeys for a specific user
     * @request GET:/v2/users/public/{userId}/journeys
     * @secure
     */
    publicUsersControllerGetPublicUserJourneys: (
      userId: string,
      query?: {
        /**
         * Sort order for the creator-specific public journey list.
         * @default "recent"
         * @example "recent"
         */
        sort?: "recent" | "oldest";
        /**
         * Optional explicit response language override for localized title/description. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "ko-KR"
         */
        lang?: string;
        /**
         * Preferred geography filter for creator-specific lists. Filters journeys by the continent inferred from stored public-memory region centers.
         * @example "asia"
         */
        continent?:
          | "asia"
          | "europe"
          | "north-america"
          | "south-america"
          | "africa"
          | "oceania"
          | "antarctica";
        /**
         * Optional opaque region identifier returned by /v2/users/public/:userId/memories/overview. Requires `continent` and must belong to that continent for the requested user.
         * @example "place:ChIJm7u-8H7raDURzR3JzA8pW4M"
         */
        regionId?: string;
        /**
         * Page number (default: 1)
         * @min 1
         * @max 100000
         * @default 1
         */
        page?: number;
        /**
         * Number of items per page (default: 20)
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneysResponseDto, void>({
        path: `/v2/users/public/${userId}/journeys`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Stores an immutable publish snapshot before upload, creates server-owned asset identities, and returns 24-hour presigned PUT URLs.
     *
     * @tags journeys
     * @name PublishJourneyControllerCreatePublishIntent
     * @summary Create a durable background publish intent
     * @request POST:/v2/journeys/publish/intents
     * @secure
     */
    publishJourneyControllerCreatePublishIntent: (
      data: CreatePublishIntentRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<CreatePublishIntentResponseDto, any>({
        path: `/v2/journeys/publish/intents`,
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
     * @tags journeys
     * @name PublishJourneyControllerCancelPublishIntent
     * @summary Cancel an active background publish intent
     * @request DELETE:/v2/journeys/publish/intents/{publishOperationId}
     * @secure
     */
    publishJourneyControllerCancelPublishIntent: (
      publishOperationId: string,
      params: RequestParams = {},
    ) =>
      this.request<CancelPublishIntentResponseDto, any>({
        path: `/v2/journeys/publish/intents/${publishOperationId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Store published journey content with images. Client provides title, description, thumbnail, and optional source language in metadata. If title is not provided, a default title will be generated based on journey date. Localized title/description/hashtags and localized cluster impressions are materialized later when admin review moves the journey into APPROVED. **Photo Upload:** - Client may send the full published photo set for the journey - recapDraft may reference only a subset of images[], but every recapDraft photo must exist in images[] **Publish Stage Contract:** - recapStage must be FINALIZED - Successful publish records start with review.status=PENDING and become publicly visible on approved public surfaces after admin approval - After publish commit, the server sends a best-effort review-submitted push notification to the owner - If `SLACK_REVIEW_WEBHOOK_URL` is configured, the server also sends a best-effort review-queue webhook after publish commit
     *
     * @tags journeys
     * @name PublishJourneyControllerPublishJourney
     * @summary Publish a journey
     * @request POST:/v2/journeys/publish
     * @secure
     */
    publishJourneyControllerPublishJourney: (
      data: PublishJourneyRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<PublishJourneyResponseDto, void>({
        path: `/v2/journeys/publish`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns publish booleans and server-side publish metadata for the given journeyId
     *
     * @tags journeys
     * @name PublishJourneyControllerGetPublishInfo
     * @summary Get publish info for a journey
     * @request GET:/v2/journeys/publish/info/{journeyId}
     */
    publishJourneyControllerGetPublishInfo: (
      journeyId: string,
      params: RequestParams = {},
    ) =>
      this.request<PublishJourneyInfoResponseDto, any>({
        path: `/v2/journeys/publish/info/${journeyId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve publicly visible approved journeys for the discovery feed. Supports legacy offset pagination and additive cursor pagination for short-feed style clients. `sort=discovery` provides a non-personalized exploration order that keeps the newest head chronological and then rotates older approved journeys more broadly with a seed-stable order. Fresh discovery requests may omit `discoverySeed`; the server will return the applied seed so later offset pages can reuse it. Seedless fresh discovery responses are not publicly cacheable; resend the returned seed to make later discovery pages deterministic. Optional `reviewStatus=APPROVED` may be supplied to make the approved-only contract explicit. Creator-specific lists should prefer `/v2/users/public/:userId/journeys`. When an optional Bearer token is present, authors in a block relationship with the authenticated viewer are suppressed from the feed.
     *
     * @tags journeys
     * @name PublishJourneyControllerGetPublishedJourneys
     * @summary Get list of published journeys (public feed)
     * @request GET:/v2/journeys/public
     * @secure
     */
    publishJourneyControllerGetPublishedJourneys: (
      query?: {
        /**
         * Offset pagination page number. Keep using this for legacy clients. Cursor mode requires page=1 or omission.
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Number of journeys to fetch. Discovery clients should keep this modest because each item carries image metadata.
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
        /**
         * Sort order. `discovery` is a non-personalized feed mode: the newest journey head stays chronological, then older approved journeys are re-ordered with seed-stable exploration. Cursor mode currently supports only recent to keep the feed contract stable.
         * @default "recent"
         * @example "recent"
         */
        sort?: "recent" | "oldest" | "discovery";
        /**
         * Deprecated creator filter on the discovery endpoint. Prefer /v2/users/public/:userId/journeys for creator-specific lists.
         * @deprecated
         * @example "507f1f77bcf86cd799439011"
         */
        userId?: string;
        /**
         * Optional review-status selector for the public feed. This endpoint exposes only approved content, so the only supported value is APPROVED.
         * @example "APPROVED"
         */
        reviewStatus?: "APPROVED";
        /**
         * Opaque cursor for recent-order public-feed pagination. Cannot be combined with sort=discovery or page greater than 1.
         * @example "eyJzb3J0QXQiOiIyMDI2LTA0LTAzVDA3OjAwOjAwLjAwMFoiLCJpZCI6IjY2MGQ4MzFhN2FlOGVjYzA0YmQ1OWJiMSJ9"
         */
        cursor?: string;
        /**
         * Opaque seed for discovery ordering. Omit on a fresh `sort=discovery` request to let the server rotate the feed, then resend the returned seed when requesting later offset pages of the same discovery session. If the requested limit already contains every matching journey, the seed can change ordering without changing membership.
         * @example "V1StGXR8_Z5j"
         */
        discoverySeed?: string;
        /**
         * Exclude journeys authored by the currently authenticated user from the discovery feed. Requires an optional Bearer token on this request.
         * @default false
         * @example true
         */
        excludeMine?: boolean;
        /**
         * Optional explicit response language override for localized title/description/impressions. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "ja"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneysResponseDto, any>({
        path: `/v2/journeys/public`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to search approved public journeys with normalized autocomplete and substring matching. Searches stored title, description, and hashtags across source metadata and localized entries, and also supports Hangul choseong-only prefix queries over the same fields. Ranking prefers exact phrase matches first, exact token matches next for single-token queries, prefix matches after that, and broader substring matches last. Ties are broken deterministically by newer publish time with `_id` as the final fallback. When an optional Bearer token is present, authors in a block relationship with the authenticated viewer are suppressed from the result set.
     *
     * @tags journeys
     * @name PublishJourneyControllerSearchPublishedJourneys
     * @summary Search approved public journeys
     * @request GET:/v2/journeys/public/search
     * @secure
     */
    publishJourneyControllerSearchPublishedJourneys: (
      query: {
        /**
         * Autocomplete or substring query for approved public journeys. Matches normalized title, description, and hashtags across source metadata and localized entries. Case, punctuation, repeated whitespace, and spacing variants are normalized, so a query like `kik i` can match `KIki`. Hangul choseong-only prefix queries such as ㄴ or ㄴㄷ are also supported. Ranking prefers exact phrase, then exact token for single-token queries, then prefix, then broader substring matches.
         * @minLength 1
         * @maxLength 100
         * @example "kik i"
         */
        q: string;
        /**
         * Offset pagination page number for search results.
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Number of search results to fetch.
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
        /**
         * Exclude journeys authored by the currently authenticated user from search results. Requires an optional Bearer token on this request.
         * @default false
         * @example true
         */
        excludeMine?: boolean;
        /**
         * Optional explicit response language override for localized title/description/impressions. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "ko"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneysResponseDto, any>({
        path: `/v2/journeys/public/search`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve published journey data for rendering. Returns full payload only when the journey is publicly visible and review-approved. Full payload includes a stable images[] registry plus timeline block photoIds/photos for media reconstruction. Hidden or pending/rejected journeys return a status-focused payload with contentStatus, notice, and review. When an optional Bearer token is present and the author is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags journeys
     * @name PublishJourneyControllerGetPublishedJourney
     * @summary Get published journey by public ID
     * @request GET:/v2/journeys/public/{publicId}
     * @secure
     */
    publishJourneyControllerGetPublishedJourney: (
      publicId: string,
      query?: {
        /**
         * Optional explicit response language override for localized title/description/impressions. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "ko"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneyDetailResponseDto, void>({
        path: `/v2/journeys/public/${publicId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve viewer payload with server-side policy branching by viewer=web|app. Both app and web return full payload only after review approval, including stable timeline media references via images[] and timeline[].photos; pending/rejected journeys return a status-focused response with contentStatus and notice. When an optional Bearer token is present and the author is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags journeys
     * @name PublishJourneyControllerGetPublishedJourneyViewer
     * @summary Get public journey viewer payload with viewer policy
     * @request GET:/v2/journeys/public/{publicId}/viewer
     * @secure
     */
    publishJourneyControllerGetPublishedJourneyViewer: (
      publicId: string,
      query: {
        /** Viewer channel policy selector */
        viewer: "web" | "app";
        /**
         * Optional explicit response language override for localized title/description/impressions. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "fr"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneyDetailResponseDto, void>({
        path: `/v2/journeys/public/${publicId}/viewer`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint to retrieve a published photo with its journey context. When an optional Bearer token is present and the author is hidden from the authenticated viewer by block policy, this endpoint returns 404.
     *
     * @tags journeys
     * @name PublishJourneyControllerGetPublishedPhoto
     * @summary Get published photo by photo ID (for SEO)
     * @request GET:/v2/journeys/public/photos/{photoId}
     * @secure
     */
    publishJourneyControllerGetPublishedPhoto: (
      photoId: string,
      query?: {
        /**
         * Optional explicit response language override for localized title/description on the parent journey metadata. If omitted, X-App-Language or Accept-Language headers may be used. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "es"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedPhotoResponseDto, void>({
        path: `/v2/journeys/public/photos/${photoId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description JWT-only endpoint for owner mismatch UX before unpublishing. Returns masked published-account hints plus the current authenticated account summary without exposing raw owner email on public journey endpoints.
     *
     * @tags journeys
     * @name PublishJourneyControllerGetUnpublishOwnershipPrecheck
     * @summary Get unpublish ownership precheck payload
     * @request GET:/v2/journeys/publish/{publicId}/unpublish-precheck
     * @secure
     */
    publishJourneyControllerGetUnpublishOwnershipPrecheck: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<UnpublishOwnershipPrecheckResponseDto, void>({
        path: `/v2/journeys/publish/${publicId}/unpublish-precheck`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Hide public exposure, then delete manifest-owned S3 images and interaction state. Cleanup failures leave a hidden retryable record. Only the owner can unpublish.
     *
     * @tags journeys
     * @name PublishJourneyControllerUnpublishJourney
     * @summary Unpublish a journey
     * @request DELETE:/v2/journeys/publish/{publicId}
     * @secure
     */
    publishJourneyControllerUnpublishJourney: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<UnpublishJourneyResponseDto, void>({
        path: `/v2/journeys/publish/${publicId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only operational list of active published journey records. Ordered by publish time descending with createdAt fallback for legacy records. Unlike public surfaces, this list includes pending/rejected review states and hidden records so moderators can inspect the full published queue.
     *
     * @tags journeys-admin
     * @name PublishJourneyAdminControllerGetAdminPublishedJourneys
     * @summary Get paginated published journeys for admin
     * @request GET:/v2/admin/journeys/publish
     * @secure
     */
    publishJourneyAdminControllerGetAdminPublishedJourneys: (
      query?: {
        /**
         * Offset pagination page number for the admin published-journey list.
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Number of published journeys to fetch for the current admin page.
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<AdminPublishedJourneysResponseDto, void>({
        path: `/v2/admin/journeys/publish`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only detail surface for published journeys. Unlike public detail endpoints, this returns the full payload even when the record is pending review, rejected, or hidden, so moderators can inspect all images and timeline content before making a decision. `localizedContent` remains optional until an APPROVED transition materializes it.
     *
     * @tags journeys-admin
     * @name PublishJourneyAdminControllerGetAdminPublishedJourney
     * @summary Get published journey detail for admin review
     * @request GET:/v2/admin/journeys/publish/{publicId}
     * @secure
     */
    publishJourneyAdminControllerGetAdminPublishedJourney: (
      publicId: string,
      query?: {
        /**
         * Optional response language for localized title/description/impressions. Accepts language code or locale: ko, en, ja, zh, es, pt, fr, th, vi, ko-KR, pt-BR, etc.
         * @example "en"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<AdminPublishedJourneyDetailResponseDto, void>({
        path: `/v2/admin/journeys/publish/${publicId}`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only moderation endpoint to move a published journey between canonical review states. New publishes start as PENDING and become publicly visible on approved public surfaces only after APPROVED. APPROVED transitions first materialize localized title/description/hashtags and localized cluster impressions; if localization fails, the review update is not committed. Review decisions also trigger best-effort owner push notifications when the state meaningfully changes.
     *
     * @tags journeys-admin
     * @name PublishJourneyAdminControllerUpdatePublishedJourneyReview
     * @summary Update published journey review status
     * @request PATCH:/v2/admin/journeys/publish/{publicId}/review
     * @secure
     */
    publishJourneyAdminControllerUpdatePublishedJourneyReview: (
      publicId: string,
      data: UpdatePublishedJourneyReviewRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<UpdatePublishedJourneyReviewResponseDto, void>({
        path: `/v2/admin/journeys/publish/${publicId}/review`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Records a country-level view event for an approved public journey. This endpoint does not expose raw viewer identity and records geography only when a trusted edge header is present.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerRecordJourneyView
     * @summary Record a public journey view
     * @request POST:/v2/journeys/public/{publicId}/view
     * @secure
     */
    journeyInteractionsControllerRecordJourneyView: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<RecordJourneyViewResponseDto, void>({
        path: `/v2/journeys/public/${publicId}/view`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns the minimal public interaction summary for an approved public journey. Like count is global; comment count is viewer-aware when an optional Bearer token is present because blocked authors are suppressed.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerGetJourneyEngagement
     * @summary Get public engagement summary for a journey
     * @request GET:/v2/journeys/public/{publicId}/engagement
     * @secure
     */
    journeyInteractionsControllerGetJourneyEngagement: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneyEngagementResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/engagement`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Adds the authenticated non-guest user to the journey like set. Repeated requests are idempotent.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerLikeJourney
     * @summary Like a public journey
     * @request PUT:/v2/journeys/public/{publicId}/like
     * @secure
     */
    journeyInteractionsControllerLikeJourney: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<LikePublishedJourneyResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/like`,
        method: "PUT",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Removes the authenticated non-guest user from the journey like set. Repeated requests are idempotent.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerUnlikeJourney
     * @summary Remove like from a public journey
     * @request DELETE:/v2/journeys/public/{publicId}/like
     * @secure
     */
    journeyInteractionsControllerUnlikeJourney: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<LikePublishedJourneyResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/like`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns visible active comments ordered newest first. When an optional Bearer token is present, comments authored by blocked users are filtered out.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerGetJourneyComments
     * @summary Get flat comments for a public journey
     * @request GET:/v2/journeys/public/{publicId}/comments
     * @secure
     */
    journeyInteractionsControllerGetJourneyComments: (
      publicId: string,
      query?: {
        /**
         * Page number
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Items per page
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneyCommentsResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/comments`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a flat comment for the authenticated non-guest user on an approved public journey.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerCreateJourneyComment
     * @summary Create a flat comment on a public journey
     * @request POST:/v2/journeys/public/{publicId}/comments
     * @secure
     */
    journeyInteractionsControllerCreateJourneyComment: (
      publicId: string,
      data: CreatePublishedJourneyCommentDto,
      params: RequestParams = {},
    ) =>
      this.request<CreatePublishedJourneyCommentResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/comments`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Soft-deletes a comment. The comment author and the journey owner may delete the comment.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerDeleteJourneyComment
     * @summary Delete a public journey comment
     * @request DELETE:/v2/journeys/public/{publicId}/comments/{commentId}
     * @secure
     */
    journeyInteractionsControllerDeleteJourneyComment: (
      publicId: string,
      commentId: string,
      params: RequestParams = {},
    ) =>
      this.request<DeletePublishedJourneyCommentResponseDto, any>({
        path: `/v2/journeys/public/${publicId}/comments/${commentId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns creator-only analytics for likes, comments, and country-level views. Country buckets below the disclosure threshold are withheld from direct output.
     *
     * @tags journeys
     * @name JourneyInteractionsControllerGetJourneyAnalytics
     * @summary Get creator analytics for a published journey
     * @request GET:/v2/journeys/publish/{publicId}/analytics
     * @secure
     */
    journeyInteractionsControllerGetJourneyAnalytics: (
      publicId: string,
      params: RequestParams = {},
    ) =>
      this.request<PublishedJourneyAnalyticsResponseDto, any>({
        path: `/v2/journeys/publish/${publicId}/analytics`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Register or update FCM device token for push notifications. Call this after user login.
     *
     * @tags notifications
     * @name NotificationsControllerRegisterFcmToken
     * @summary Register FCM token
     * @request POST:/v2/notifications/fcm-token
     * @secure
     */
    notificationsControllerRegisterFcmToken: (
      data: RegisterFcmTokenDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/v2/notifications/fcm-token`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete FCM device token. Call this when user logs out or switches account.
     *
     * @tags notifications
     * @name NotificationsControllerDeleteFcmToken
     * @summary Delete FCM token
     * @request DELETE:/v2/notifications/fcm-token
     * @secure
     */
    notificationsControllerDeleteFcmToken: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/v2/notifications/fcm-token`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Enable or disable push notifications
     *
     * @tags notifications
     * @name NotificationsControllerUpdateNotificationSettings
     * @summary Update notification settings
     * @request PATCH:/v2/notifications/settings
     * @secure
     */
    notificationsControllerUpdateNotificationSettings: (
      data: UpdateNotificationSettingsDto,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/v2/notifications/settings`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 콘텐츠 또는 사용자를 신고합니다
     *
     * @tags reports
     * @name ReportsControllerCreateReport
     * @summary 신고 생성
     * @request POST:/v2/reports
     * @secure
     */
    reportsControllerCreateReport: (
      data: CreateReportDto,
      params: RequestParams = {},
    ) =>
      this.request<CreateReportResponseDto, void>({
        path: `/v2/reports`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only paginated report queue. Supports filtering by status, target type, reason, target id, and reporter id. Returns reporter/target snapshots and per-target report counts for moderation tooling.
     *
     * @tags reports-admin
     * @name AdminReportsControllerGetAdminReports
     * @summary List reports for admin moderation
     * @request GET:/v2/admin/reports
     * @secure
     */
    adminReportsControllerGetAdminReports: (
      query?: {
        /**
         * 페이지 번호
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * 페이지당 항목 수
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
        /** 신고 상태 필터 */
        status?: "pending" | "reviewed" | "resolved" | "rejected";
        /** 신고 대상 타입 필터 */
        targetType?: "user" | "published_journey";
        /** 신고 사유 필터 */
        reason?:
          | "spam"
          | "abuse"
          | "hate"
          | "sexual"
          | "inappropriate"
          | "other";
        /**
         * 특정 신고 대상 ID 필터
         * @example "public_q83znM2ap"
         */
        targetId?: string;
        /**
         * 특정 신고자 ID 필터
         * @example "680657032be53a7892fe5ghi"
         */
        reporterId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<AdminReportsResponseDto, void>({
        path: `/v2/admin/reports`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only summary counts for the moderation dashboard. Includes counts by report status and by report target type.
     *
     * @tags reports-admin
     * @name AdminReportsControllerGetAdminReportStats
     * @summary Get admin report queue statistics
     * @request GET:/v2/admin/reports/stats
     * @secure
     */
    adminReportsControllerGetAdminReportStats: (params: RequestParams = {}) =>
      this.request<AdminReportStatsResponseDto, void>({
        path: `/v2/admin/reports/stats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only detail read for a single report, including reporter summary, target snapshot, and aggregated counts for the same target.
     *
     * @tags reports-admin
     * @name AdminReportsControllerGetAdminReport
     * @summary Get one report for admin moderation
     * @request GET:/v2/admin/reports/{reportId}
     * @secure
     */
    adminReportsControllerGetAdminReport: (
      reportId: string,
      params: RequestParams = {},
    ) =>
      this.request<AdminReportDetailResponseDto, void>({
        path: `/v2/admin/reports/${reportId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only partial update endpoint for report status and admin note. Terminal decisions (`resolved`, `rejected`) record resolution metadata. For published-journey targets, status changes also re-evaluate report-driven visibility.
     *
     * @tags reports-admin
     * @name AdminReportsControllerUpdateAdminReport
     * @summary Update report moderation state
     * @request PATCH:/v2/admin/reports/{reportId}
     * @secure
     */
    adminReportsControllerUpdateAdminReport: (
      reportId: string,
      data: UpdateAdminReportDto,
      params: RequestParams = {},
    ) =>
      this.request<AdminReportMutationResponseDto, void>({
        path: `/v2/admin/reports/${reportId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Generate photo-only recap draft from recap input metadata and photo EXIF metadata. Returns export-safe payload only. Internal diagnostics are stored server-side.
     *
     * @tags journeys
     * @name JourneyRecapControllerCreateDraft
     * @summary Generate recap draft
     * @request POST:/v2/journeys/recap/draft
     */
    journeyRecapControllerCreateDraft: (
      data: CreateJourneyRecapDraftRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<JourneyRecapDraftResponseDto, any>({
        path: `/v2/journeys/recap/draft`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Runs post-processing GPS outlier correction statelessly. Requires recapDraft payload from /v2/journeys/recap/draft response and returns export-safe payload.
     *
     * @tags journeys
     * @name JourneyRecapControllerCorrectGpsOutliers
     * @summary Correct GPS outlier photos in recap draft
     * @request POST:/v2/journeys/recap/draft/correct-gps-outliers
     */
    journeyRecapControllerCorrectGpsOutliers: (
      data: CorrectJourneyRecapDraftRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<JourneyRecapCorrectedDraftResponseDto, any>({
        path: `/v2/journeys/recap/draft/correct-gps-outliers`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns a presigned URL that allows the client to upload files directly to S3 without exposing AWS credentials
     *
     * @tags uploads
     * @name UploadsControllerGeneratePresignedUrl
     * @summary Generate presigned URL for client-side S3 upload
     * @request POST:/v2/uploads/presign
     * @secure
     */
    uploadsControllerGeneratePresignedUrl: (
      data: PresignUploadRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<PresignUploadResponseDto, void>({
        path: `/v2/uploads/presign`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Validates the whole batch before returning presigned URLs in request order. Any invalid item or access conflict rejects the entire batch.
     *
     * @tags uploads
     * @name UploadsControllerGenerateBatchPresignedUrls
     * @summary Generate multiple presigned URLs for client-side S3 uploads
     * @request POST:/v2/uploads/presign/batch
     * @secure
     */
    uploadsControllerGenerateBatchPresignedUrls: (
      data: BatchPresignUploadRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<BatchPresignUploadResponseDto, void>({
        path: `/v2/uploads/presign/batch`,
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
     * @tags apps
     * @name AppsVersionControllerCheckVersion
     * @summary Check if app should update (force/soft)
     * @request GET:/v2/apps/check
     */
    appsVersionControllerCheckVersion: (
      query: {
        platform: "ios" | "android";
        /**
         * SemVer like 1.2.3
         * @example "1.8.4"
         */
        version: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<VersionCheckResponseDto, any>({
        path: `/v2/apps/check`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint for admin-managed editorial articles. Returns articles for the requested language, ordered by publish time descending.
     *
     * @tags articles
     * @name ArticlesControllerGetPublicArticles
     * @summary List editorial articles
     * @request GET:/v2/articles
     */
    articlesControllerGetPublicArticles: (
      query?: {
        /**
         * Optional explicit article language override. If omitted, X-App-Language or Accept-Language headers may be used before the English default. Accepts language code or locale: en, ko, ja, zh, es, pt, fr, th, vi, en-US, ko-KR, etc.
         * @example "en-US"
         */
        lang?: string;
        /**
         * Optional editorial category filter
         * @example "wellbeing-guide"
         */
        category?:
          | "festival"
          | "travel-guide"
          | "destination-guide"
          | "wellbeing-guide";
        /**
         * Offset pagination page number
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Number of public articles to fetch
         * @min 1
         * @max 50
         * @default 12
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicArticlesResponseDto, any>({
        path: `/v2/articles`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Public endpoint for a single editorial article. Returns markdown body content and sibling alternates for hreflang-aware rendering.
     *
     * @tags articles
     * @name ArticlesControllerGetPublicArticle
     * @summary Get an editorial article by slug
     * @request GET:/v2/articles/{slug}
     */
    articlesControllerGetPublicArticle: (
      slug: string,
      query?: {
        /**
         * Optional explicit article language override. If omitted, X-App-Language or Accept-Language headers may be used before the English default. Accepts language code or locale: en, ko, ja, zh, es, pt, fr, th, vi, en-US, ko-KR, etc.
         * @example "fr-FR"
         */
        lang?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<PublicArticleDetailResponseDto, void>({
        path: `/v2/articles/${slug}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only operational list for first-party editorial articles. Supports pagination plus optional language and category filters.
     *
     * @tags articles-admin
     * @name ArticlesAdminControllerGetAdminArticles
     * @summary List editorial articles for admin
     * @request GET:/v2/admin/articles
     * @secure
     */
    articlesAdminControllerGetAdminArticles: (
      query?: {
        /**
         * Requested article language. Accepts language code or locale: en, ko, ja, zh, es, pt, fr, th, vi, en-US, ko-KR, etc.
         * @example "ko-KR"
         */
        lang?: string;
        /** @example "wellbeing-guide" */
        category?:
          | "festival"
          | "travel-guide"
          | "destination-guide"
          | "wellbeing-guide";
        /**
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * @min 1
         * @max 50
         * @default 20
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<AdminArticlesResponseDto, any>({
        path: `/v2/admin/articles`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only create endpoint for first-party editorial articles. The article is published immediately after validation. Leave translationGroupId empty to start a new article group.
     *
     * @tags articles-admin
     * @name ArticlesAdminControllerCreateAdminArticle
     * @summary Create an editorial article
     * @request POST:/v2/admin/articles
     * @secure
     */
    articlesAdminControllerCreateAdminArticle: (
      data: CreateAdminArticleRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<AdminArticleMutationResponseDto, any>({
        path: `/v2/admin/articles`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only detail read for a first-party editorial article, including sibling translations in the same translation group.
     *
     * @tags articles-admin
     * @name ArticlesAdminControllerGetAdminArticle
     * @summary Get one editorial article for admin
     * @request GET:/v2/admin/articles/{articleId}
     * @secure
     */
    articlesAdminControllerGetAdminArticle: (
      articleId: string,
      params: RequestParams = {},
    ) =>
      this.request<AdminArticleDetailResponseDto, any>({
        path: `/v2/admin/articles/${articleId}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only update endpoint for first-party editorial articles. Supports category, title, and markdown body edits; language, slug, and translationGroupId are create-time identity fields.
     *
     * @tags articles-admin
     * @name ArticlesAdminControllerUpdateAdminArticle
     * @summary Update an editorial article
     * @request PATCH:/v2/admin/articles/{articleId}
     * @secure
     */
    articlesAdminControllerUpdateAdminArticle: (
      articleId: string,
      data: UpdateAdminArticleRequestDto,
      params: RequestParams = {},
    ) =>
      this.request<AdminArticleMutationResponseDto, any>({
        path: `/v2/admin/articles/${articleId}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Admin-only hard delete endpoint for first-party editorial articles.
     *
     * @tags articles-admin
     * @name ArticlesAdminControllerDeleteAdminArticle
     * @summary Delete an editorial article
     * @request DELETE:/v2/admin/articles/{articleId}
     * @secure
     */
    articlesAdminControllerDeleteAdminArticle: (
      articleId: string,
      params: RequestParams = {},
    ) =>
      this.request<AdminDeleteArticleResponseDto, any>({
        path: `/v2/admin/articles/${articleId}`,
        method: "DELETE",
        secure: true,
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

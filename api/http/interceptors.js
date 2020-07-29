import TokenService from "../services/tokenService";
const tokenService = new TokenService();

export function tokenInterceptor(request) {
  const token = request.headers["x-access-token"];
  return tokenService.validateToken(token);
}

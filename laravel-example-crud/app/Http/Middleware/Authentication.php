<?php

namespace App\Http\Middleware;

use Auth;
use Closure;
use Illuminate\Http\Request;
use Str;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;
class Authentication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $accessToken = $this->getToken($request->headers->get("Authorization"));
        if (!$accessToken) {
            return response()->json([
                "status" => "error",
                "message" => "UnAuthorization"
            ], 401);
        }

        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json([
                    "status" => "error",
                    "message" => "Token is invalid"
                ], 401);
            }
            return $next($request);
        } catch (TokenExpiredException $e) {
            return response()->json([
                "status" => "error",
                "message" => "Token has expired"
            ], 401);
        } catch (TokenInvalidException $e) {
            return response()->json([
                "status" => "error",
                "message" => "Token is invalid"
            ], 401);
        } catch (\Exception $e) {
            return response()->json([
                "status" => "error",
                "message" => "Token not found"
            ], 401);
        }
    }

    protected function getToken($bearerToken)
    {
        if (Str::startsWith($bearerToken, "Bearer")) {
            return Str::substr($bearerToken, 7);
        }
        return null;
    }
}

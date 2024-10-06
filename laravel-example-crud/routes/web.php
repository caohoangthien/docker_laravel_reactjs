<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Middleware\Authentication;
use Illuminate\Support\Facades\Route;

Route::post("/register", [AuthController::class, "register"]);
Route::post("/login", [AuthController::class, "login"]);
Route::post("/refresh-token", [AuthController::class, "refresh"]);

Route::middleware([Authentication::class])->group(
    function ($router) {
        Route::post("/logout", [AuthController::class, "logout"]);
        Route::get("/me", [AuthController::class, "me"]);

        Route::resource('tasks', TaskController::class);
    }
);

Route::get('/', function () {
    return view('welcome');
});
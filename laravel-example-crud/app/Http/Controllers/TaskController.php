<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Str;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        ///
        $tasks = Task::all();
        return response()->json($tasks);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
        $validated = $request->validate([
            'task_name' => 'required|string|max:255',
            'status' => 'required|integer',
            'create_by' => 'required|integer',
        ]);

        $task = Task::create([
            'id' => (string) Str::uuid(),
            'task_name' => $validated['task_name'],
            'status' => $validated['status'],
            'create_by' => $validated['create_by'],
            'create_at' => now(),
        ]);

        return response()->json($task, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'task not found'], 404);
        }

        return response()->json($task);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['message' => 'task not found'], 404);
        }

        $validated = $request->validate([
            'task_name' => 'sometimes|required|string|max:255',
            'status' => 'sometimes|required|integer',
            'create_by' => 'sometimes|required|integer',
        ]);
        $task->update([
            'task_name' => $validated['task_name'],
            'status' => $validated['status'],
            'create_by' => $validated['create_by'],
        ]);

        dd($task);

        return response()->json($task, status: 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
        $task = Task::find($id);
        if (!$task) {
            return response()->json(['message' => 'task not found'], 404);
        }
        $task->delete();
        return response()->json(['message' => 'task deleted'], status: 200);
    }
}

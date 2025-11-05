package com.diih.todolist.to_do_list.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.diih.todolist.to_do_list.entity.Task;
import com.diih.todolist.to_do_list.entity.User;
import com.diih.todolist.to_do_list.repository.TaskRepository;
import com.diih.todolist.to_do_list.repository.UserRepository;
import com.diih.todolist.to_do_list.security.service.UserDetailsImpl;

import org.springframework.http.HttpStatus;


import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found in database."));
    }

    @GetMapping
    public List<Task> getTasks() {
        return taskRepository.findByUserId(getAuthenticatedUser().getId());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        User user = getAuthenticatedUser();
        task.setUser(user);
        task.setCompleted(false);
        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        User user = getAuthenticatedUser();

        return taskRepository.findById(id).map(task -> {
            if (!task.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"message\": \"Error: You don't have permission to update this task.\"}");
            }

            if (taskDetails.getName() != null) {
                task.setName(taskDetails.getName());
            }
            if (taskDetails.getDescription() != null) {
                task.setDescription(taskDetails.getDescription());
            }
            task.setCompleted(taskDetails.isCompleted());
            
            Task updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id).map(task -> {
            if (!task.getUser().getId().equals(getAuthenticatedUser().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"message\": \"Error: You don't have permission to delete this task.\"}");
            }

            taskRepository.delete(task);
            return ResponseEntity.ok().body("{\"message\": \"Task deleted successfully!\"}");
        }).orElse(ResponseEntity.notFound().build());
    }
}

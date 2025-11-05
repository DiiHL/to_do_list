package com.diih.todolist.to_do_list.DTO.request;

import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @Size(min = 3, max = 20)
    private String username;

    @Size(min = 6, max = 40)
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
} 

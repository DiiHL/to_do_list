package com.diih.todolist.to_do_list.service;

import com.diih.todolist.to_do_list.DTO.request.LoginRequest;
import com.diih.todolist.to_do_list.DTO.request.SignupRequest;
import com.diih.todolist.to_do_list.DTO.response.JwtResponse;
import com.diih.todolist.to_do_list.DTO.response.MessageResponse;

public interface AuthInterface {
    MessageResponse registerUser(SignupRequest signupRequest);
    JwtResponse authenticateUser(LoginRequest loginRequest);
}

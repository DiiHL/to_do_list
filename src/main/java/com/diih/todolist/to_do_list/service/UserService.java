package com.diih.todolist.to_do_list.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.diih.todolist.to_do_list.DTO.request.ProfileUpdateRequest;
import com.diih.todolist.to_do_list.entity.User;
import com.diih.todolist.to_do_list.repository.UserRepository;

@Service
public class UserService  {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void updateUserProfile(String currentUsername, ProfileUpdateRequest updateRequest) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Error: Usuario não encontrado"));

        String newUsername = updateRequest.getUsername();
        if (StringUtils.hasText(newUsername) && !newUsername.equals(currentUsername)) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new RuntimeException("Error: Username is already taken!");
            }
            user.setUsername(newUsername);
        }

        String newPassword = updateRequest.getPassword();
        if (StringUtils.hasText(newPassword)) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        userRepository.save(user);
    }

    @Transactional
    public void deleteUserAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: Usuario não encontrado"));
        userRepository.delete(user);
    }
}

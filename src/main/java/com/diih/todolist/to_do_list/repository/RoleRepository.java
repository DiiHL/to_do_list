package com.diih.todolist.to_do_list.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.diih.todolist.to_do_list.entity.ERole;
import com.diih.todolist.to_do_list.entity.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}

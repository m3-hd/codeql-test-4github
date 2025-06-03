package com.ieyasu.member

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan

@EnableAutoConfiguration
@SpringBootApplication
@ComponentScan
@OpenAPIDefinition(info = Info(title = "Member API", version = "1.0.0", description = "Member用のOpenAPIドキュメントです"))
class BackendApplication

fun main(args: Array<String>) {
    runApplication<BackendApplication>(*args)
}

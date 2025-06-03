package com.ieyasu.manage

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import java.sql.Connection
import java.sql.DriverManager
import java.util.Base64

@EnableAutoConfiguration
@SpringBootApplication
@ComponentScan
@OpenAPIDefinition(info = Info(title = "Manage API", version = "1.0.0", description = "Manage用のOpenAPIドキュメントです"))
class BackendApplication {
    // SecurityIssues クラスの内容をここに統合
    private val hardcodedPassword = "SuperSecretPassword123"

    fun unsafeSQL(userInput: String) {
        val connection: Connection = DriverManager.getConnection("jdbc:mysql://localhost/db", "user", hardcodedPassword)
        val statement = connection.createStatement()
        // SQL Injection vulnerability
        val resultSet = statement.executeQuery("SELECT * FROM users WHERE name = '$userInput'")
    }

    fun weakEncryption(data: String): String {
        // Weak encryption method
        return Base64.getEncoder().encodeToString(data.toByteArray())
    }

    fun nullPointerRisk(obj: Any?): Int {
        // Potential null pointer exception
        return obj!!.hashCode()
    }

    fun resourceLeak() {
        val file = java.io.FileInputStream("example.txt")
        // Resource leak: file is never closed
    }

    fun insecureRandom(): Int {
        // Using insecure random number generator
        return java.util.Random().nextInt()
    }
}

fun main(args: Array<String>) {
    val app = BackendApplication()
    runApplication<BackendApplication>(*args)
    println("Insecure random: ${app.insecureRandom()}")
}
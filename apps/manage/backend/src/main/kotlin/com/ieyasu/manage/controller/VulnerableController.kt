package com.ieyasu.manage.controller

import com.ieyasu.manage.BackendApplication
import jakarta.servlet.http.HttpServletRequest
import java.sql.Connection
import java.sql.DriverManager
import java.util.Base64
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/vulnerable")
class VulnerableController {

  private val backendApp = BackendApplication()

  // SQL Injection vulnerability - user input directly flows to SQL query
  @GetMapping("/users")
  fun getUsers(@RequestParam("name") userName: String): ResponseEntity<String> {
    try {
      // This creates a Source-to-Sink flow that CodeQL can detect
      backendApp.unsafeSQL(userName)
      return ResponseEntity.ok("User search completed for: $userName")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Error: ${e.message}")
    }
  }

  // Command Injection vulnerability
  @PostMapping("/execute")
  fun executeCommand(@RequestBody command: String): ResponseEntity<String> {
    try {
      // Direct command execution with user input - highly dangerous
      val process = Runtime.getRuntime().exec(command)
      val result = process.inputStream.bufferedReader().readText()
      return ResponseEntity.ok("Command output: $result")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Error: ${e.message}")
    }
  }

  // Path Traversal vulnerability
  @GetMapping("/file")
  fun readFile(@RequestParam("path") filePath: String): ResponseEntity<String> {
    try {
      // User can potentially access any file on the system
      val file = java.io.File(filePath)
      val content = file.readText()
      return ResponseEntity.ok("File content: $content")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Error: ${e.message}")
    }
  }

  // XSS vulnerability through response
  @GetMapping("/echo")
  fun echoInput(@RequestParam("input") userInput: String): ResponseEntity<String> {
    // User input directly returned without sanitization
    return ResponseEntity.ok("<html><body><h1>You entered: $userInput</h1></body></html>")
  }

  // LDAP Injection vulnerability
  @GetMapping("/ldap")
  fun ldapSearch(@RequestParam("filter") searchFilter: String): ResponseEntity<String> {
    try {
      // Simulated LDAP query construction with user input
      val ldapQuery = "(&(objectClass=person)(cn=$searchFilter))"
      // In real scenario, this would be passed to LDAP search
      return ResponseEntity.ok("LDAP query executed: $ldapQuery")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Error: ${e.message}")
    }
  }

  // Weak cryptography with user data
  @PostMapping("/encrypt")
  fun encryptData(@RequestBody data: String): ResponseEntity<String> {
    val encrypted = backendApp.weakEncryption(data)
    return ResponseEntity.ok("Encrypted data: $encrypted")
  }

  // Insecure deserialization
  @PostMapping("/deserialize")
  fun deserializeObject(@RequestBody serializedData: String): ResponseEntity<String> {
    try {
      val bytes = Base64.getDecoder().decode(serializedData)
      val objectInputStream = java.io.ObjectInputStream(java.io.ByteArrayInputStream(bytes))
      val obj = objectInputStream.readObject()
      return ResponseEntity.ok("Deserialized object: ${obj.toString()}")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Error: ${e.message}")
    }
  }

  // HTTP Header Injection
  @GetMapping("/redirect")
  fun redirectUser(
          @RequestParam("url") redirectUrl: String,
          request: HttpServletRequest
  ): ResponseEntity<String> {
    // User input directly used in HTTP response header
    return ResponseEntity.status(302)
            .header("Location", redirectUrl)
            .body("Redirecting to: $redirectUrl")
  }

  // SQL Injection with different pattern
  @PostMapping("/login")
  fun authenticateUser(@RequestBody credentials: Map<String, String>): ResponseEntity<String> {
    val username = credentials["username"] ?: ""
    val password = credentials["password"] ?: ""

    try {
      val connection: Connection =
              DriverManager.getConnection("jdbc:mysql://localhost/db", "user", "password")
      val statement = connection.createStatement()

      // Another SQL injection pattern
      val query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'"
      val resultSet = statement.executeQuery(query)

      return if (resultSet.next()) {
        ResponseEntity.ok("Login successful for user: $username")
      } else {
        ResponseEntity.badRequest().body("Invalid credentials")
      }
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("Database error: ${e.message}")
    }
  }

  // XXE (XML External Entity) vulnerability
  @PostMapping("/xml")
  fun processXml(@RequestBody xmlContent: String): ResponseEntity<String> {
    try {
      val factory = javax.xml.parsers.DocumentBuilderFactory.newInstance()
      // Vulnerable configuration - external entities enabled
      factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", false)
      factory.setFeature("http://xml.org/sax/features/external-general-entities", true)
      factory.setFeature("http://xml.org/sax/features/external-parameter-entities", true)

      val builder = factory.newDocumentBuilder()
      val document = builder.parse(java.io.ByteArrayInputStream(xmlContent.toByteArray()))

      return ResponseEntity.ok("XML processed successfully")
    } catch (e: Exception) {
      return ResponseEntity.badRequest().body("XML processing error: ${e.message}")
    }
  }
}

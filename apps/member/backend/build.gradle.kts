plugins {
    kotlin("jvm") version "1.9.25"
    kotlin("plugin.spring") version "1.9.25"
    id("org.springframework.boot") version "3.4.1"
    id("org.springdoc.openapi-gradle-plugin") version "1.9.0"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("plugin.serialization") version "1.9.20"
    kotlin("plugin.jpa") version "1.9.25"
}

group = "com.ieyasu.member"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

val ktlint by configurations.creating

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("software.amazon.awssdk:secretsmanager:2.30.7")
    implementation("software.amazon.awssdk:auth:2.30.7")
    implementation("com.nimbusds:nimbus-jose-jwt:10.0.1")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-api:2.8.3")
    implementation("org.springdoc:springdoc-openapi-webmvc-core:1.8.0")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json")
    implementation("software.amazon.awssdk:s3:2.20.26")
    runtimeOnly("org.postgresql:postgresql")
    developmentOnly("com.h2database:h2")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.boot:spring-boot-starter-security")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.mockito.kotlin:mockito-kotlin:4.1.0")
    testRuntimeOnly("com.h2database:h2")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    ktlint("com.pinterest.ktlint:ktlint-cli:1.5.0") {
        attributes {
            attribute(Bundling.BUNDLING_ATTRIBUTE, objects.named(Bundling.EXTERNAL))
        }
    }
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

allOpen {
    annotation("jakarta.persistence.Entity")
    annotation("jakarta.persistence.MappedSuperclass")
    annotation("jakarta.persistence.Embeddable")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

// Unit Tests
tasks.register<Test>("ut") {
    description = "Runs unit tests"
    useJUnitPlatform {
        includeTags("unit")
        excludeTags("e2e")
    }
    systemProperty("spring.profiles.active", "test-ut, test")
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    jvmArgs(
        "-XX:+EnableDynamicAgentLoading",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "-javaagent:${configurations.testRuntimeClasspath.get().find { it.name.contains("mockito-core") }?.absolutePath}",
    )
}

// E2E Tests
tasks.register<Test>("test-local") {
    description = "Runs end-to-end tests on local"
    useJUnitPlatform {
        includeTags("e2e")
        excludeTags("unit")
    }
    systemProperty("spring.profiles.active", "test-local")
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    jvmArgs(
        "-XX:+EnableDynamicAgentLoading",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "-javaagent:${configurations.testRuntimeClasspath.get().find { it.name.contains("mockito-core") }?.absolutePath}",
    )
}

// Tests on docker
tasks.register<Test>("test-docker") {
    description = "Runs tests with docker profile"
    useJUnitPlatform {
        includeTags("e2e")
        excludeTags("unit")
    }
    systemProperty("spring.profiles.active", "test-docker")
    testClassesDirs = sourceSets["test"].output.classesDirs
    classpath = sourceSets["test"].runtimeClasspath
    jvmArgs(
        "-XX:+EnableDynamicAgentLoading",
        "--add-opens=java.base/java.lang=ALL-UNNAMED",
        "-javaagent:${configurations.testRuntimeClasspath.get().find { it.name.contains("mockito-core") }?.absolutePath}",
    )
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "21"
    }
}

openApi {
    apiDocsUrl = "http://localhost:9080/v3/api-docs.yaml"
    outputDir = file("$projectDir/../docs")
    outputFileName = "openapi.yaml"
    waitTimeInSeconds = 5
    customBootRun {
        args = listOf("--spring.profiles.active=openapi")
    }
}

tasks.register<JavaExec>("ktlintCheck") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Check Kotlin code style"
    classpath = ktlint
    mainClass = "com.pinterest.ktlint.Main"
    args =
        listOf(
            "**/src/**/*.kt",
            "**.kts",
            "!**/build/**",
            "!**/build.gradle.kts",
        )
}

tasks.check {
    dependsOn(tasks.named("ktlintCheck"))
}

tasks.register<JavaExec>("ktlintFormat") {
    group = LifecycleBasePlugin.VERIFICATION_GROUP
    description = "Check Kotlin code style and format"
    classpath = ktlint
    mainClass = "com.pinterest.ktlint.Main"
    jvmArgs("--add-opens=java.base/java.lang=ALL-UNNAMED")
    args =
        listOf(
            "-F",
            "**/src/**/*.kt",
            "**.kts",
            "!**/build/**",
        )
}

// bootBuildImageの参考記事 : https://www.nri-digital.jp/tech/20250107-19725/
tasks.bootBuildImage {
    // tinyは最小イメージのためログインシェルが含まれておらず、踏み台コンテナとして流用できない。curlなどもないためコンテナのヘルスチェックもできない
    // builder = "paketobuildpacks/builder-jammy-java-tiny:latest"
    // paketobuildpacks/builder-jammy-base, full は ARM64 に対応していない
    builder = "paketobuildpacks/builder-jammy-full"
    // Googleのビルダーを使用する場合
    // builder = "gcr.io/buildpacks/builder:google-22"

    buildpacks =
        listOf(
            "gcr.io/paketo-buildpacks/amazon-corretto",
            "gcr.io/paketo-buildpacks/java",
        )
    // コンテナのヘルスチェックでcurlを利用するためにbuilder-jammy-fullを使用する場合、
    // ARM64に対応していないため、ARM64でのビルドはできない
    // imagePlatform = "linux/arm64"
    imagePlatform = "linux/amd64"
    imageName = "v1-ieyasu-member-api"
    createdDate = "now"

    environment =
        mapOf(
            "BP_JVM_VERSION" to "21",
            "BP_JAVA_DISTRIBUTION" to "corretto",
            "BP_JVM_JLINK_ENABLED" to "true",
        )
}

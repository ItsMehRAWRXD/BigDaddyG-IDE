plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.9.20"
    id("org.jetbrains.intellij") version "1.16.1"
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.20"
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("org.owasp.dependencycheck") version "8.4.2"
    id("com.diffplug.spotless") version "6.22.0"
}

group = "com.bigdaddyg"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // Core dependencies
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.google.code.gson:gson:2.10.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    
    // Security dependencies
    implementation("io.jsonwebtoken:jjwt-api:0.12.3")
    implementation("io.jsonwebtoken:jjwt-impl:0.12.3")
    implementation("io.jsonwebtoken:jjwt-jackson:0.12.3")
    implementation("org.bouncycastle:bcprov-jdk18on:1.77")
    implementation("org.bouncycastle:bcpkix-jdk18on:1.77")
    implementation("com.nimbusds:nimbus-jose-jwt:9.37.3")
    
    // Logging and monitoring
    implementation("org.slf4j:slf4j-api:2.0.9")
    implementation("ch.qos.logback:logback-classic:1.4.14")
    implementation("net.logstash.logback:logstash-logback-encoder:7.4")
    implementation("io.micrometer:micrometer-core:1.12.0")
    
    // Performance and caching
    implementation("com.github.ben-manes.caffeine:caffeine:3.1.8")
    implementation("org.apache.commons:commons-lang3:3.14.0")
    implementation("org.apache.commons:commons-collections4:4.4")
    implementation("com.google.guava:guava:32.1.3-jre")
    
    // JSON processing
    implementation("com.fasterxml.jackson.core:jackson-databind:2.16.1")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.16.1")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.16.1")
    
    // Validation and sanitization
    implementation("org.owasp.encoder:encoder:1.2.3")
    implementation("org.hibernate.validator:hibernate-validator:8.0.1.Final")
    implementation("jakarta.validation:jakarta.validation-api:3.0.2")
    
    // Configuration management
    implementation("com.typesafe:config:1.4.3")
    implementation("org.yaml:snakeyaml:2.2")
    
    // Testing dependencies
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.1")
    testImplementation("org.mockito:mockito-core:5.8.0")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.2.1")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("org.testcontainers:junit-jupiter:1.19.3")
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
    testImplementation("org.awaitility:awaitility-kotlin:4.2.0")
}

intellij {
    version.set("2023.3.2")
    type.set("IC")
    plugins.set(listOf(
        "com.intellij.java",
        "org.jetbrains.plugins.terminal",
        "Git4Idea",
        "com.intellij.database",
        "JavaScript",
        "org.jetbrains.plugins.yaml",
        "org.jetbrains.kotlin",
        "com.intellij.gradle",
        "org.intellij.plugins.markdown"
    ))
    
    downloadSources.set(true)
    updateSinceUntilBuild.set(false)
    instrumentCode.set(false)
}

// Security configuration
dependencyCheck {
    failBuildOnCVSS = 7.0f
    suppressionFile = "dependency-check-suppressions.xml"
    analyzers {
        assemblyEnabled = false
        nuspecEnabled = false
        nugetconfEnabled = false
    }
}

// Code formatting
spotless {
    kotlin {
        target("**/*.kt")
        ktlint("0.50.0")
        trimTrailingWhitespace()
        endWithNewline()
    }
    java {
        target("**/*.java")
        googleJavaFormat()
        trimTrailingWhitespace()
        endWithNewline()
    }
}

tasks {
    withType<JavaCompile> {
        sourceCompatibility = "17"
        targetCompatibility = "17"
        options.encoding = "UTF-8"
        options.compilerArgs.addAll(listOf(
            "-Xlint:all",
            "-Xlint:-serial",
            "-Werror"
        ))
    }
    
    withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
        kotlinOptions {
            jvmTarget = "17"
            freeCompilerArgs = listOf(
                "-Xjsr305=strict",
                "-Xopt-in=kotlin.RequiresOptIn",
                "-Xcontext-receivers"
            )
        }
    }

    test {
        useJUnitPlatform()
        systemProperty("junit.jupiter.execution.parallel.enabled", "true")
        systemProperty("junit.jupiter.execution.parallel.mode.default", "concurrent")
        maxParallelForks = Runtime.getRuntime().availableProcessors()
        
        testLogging {
            events("passed", "skipped", "failed")
            showStandardStreams = false
        }
    }

    patchPluginXml {
        sinceBuild.set("233")
        untilBuild.set("241.*")
        
        pluginDescription.set("""
            BigDaddyG IDE Extension for JetBrains IDEs.
            Provides advanced AI-powered coding assistance with enhanced security features.
        """.trimIndent())
        
        changeNotes.set("""
            <ul>
                <li>Enhanced security features</li>
                <li>Improved performance optimizations</li>
                <li>Updated dependencies for better stability</li>
                <li>Added comprehensive logging and monitoring</li>
            </ul>
        """.trimIndent())
    }

    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }

    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
        channels.set(listOf("stable"))
    }
    
    shadowJar {
        archiveClassifier.set("")
        relocate("com.google.gson", "com.bigdaddyg.shaded.gson")
        relocate("okhttp3", "com.bigdaddyg.shaded.okhttp3")
        relocate("okio", "com.bigdaddyg.shaded.okio")
        
        manifest {
            attributes(
                "Implementation-Title" to project.name,
                "Implementation-Version" to project.version,
                "Built-By" to System.getProperty("user.name"),
                "Built-JDK" to System.getProperty("java.version"),
                "Created-By" to "Gradle ${gradle.gradleVersion}"
            )
        }
    }
    
    dependencyCheck {
        dependsOn("build")
    }
    
    check {
        dependsOn("dependencyCheck", "spotlessCheck")
    }
}

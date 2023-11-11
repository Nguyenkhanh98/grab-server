
import groovy.json.JsonSlurperClassic
pipeline {
    agent any
    stages {
        stage('Build and Deploy') {
            steps {
                sh "docker-compose up -d --build "
            }
        }
    }
}
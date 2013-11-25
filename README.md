teamproject_backend
===================

## 소개

TeamProject는 개인 혹은 소규모 조직을 위한 공유 TODO 기반 업무 협업 도구입니다.

TeamProject BackEnd 서버는 RESTful API 기반으로 동작합니다.


## 설치

*1. mongodb, redis를 설치한다.*

*2. mailer 설치*

    teamproject_backend/teamproject_mailer/config.js 에 발신용 메일계정을 설정한다.

*3. TeamProject를 설치한다.*

    $ git clone https://github.com/mtreesoft/teamproject_backend.git
    $ cd teamproject_backend/teamproject_server
    $ npm install
    
## 시작

    $ node teamproject.js

## Restful APIs

[Restful-APIs](https://github.com/mtreesoft/teamproject_backend/wiki/Restful-APIs)

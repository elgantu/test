    testSize(face) {
        // Нормализация координат глаза для определения масштаба глаза на изображении
        const [leftInner, leftOuter] = face.keypoints[159].x < face.keypoints[386].x
            ? [face.keypoints[159], face.keypoints[386]] : [face.keypoints[386], face.keypoints[159]];
        const [rightInner, rightOuter] = face.keypoints[145].x < face.keypoints[362].x
            ? [face.keypoints[145], face.keypoints[362]] : [face.keypoints[362], face.keypoints[145]];
        const leftEyeWidth = Math.sqrt(Math.pow((leftOuter.x - leftInner.x), 2) +
            Math.pow((leftOuter.y - leftInner.y), 2));
        const rightEyeWidth = Math.sqrt(Math.pow((rightOuter.x - rightInner.x), 2) +
            Math.pow((rightOuter.y - rightInner.y), 2));

        // Определение угла между линиями, проведенными через центры глаз
        const eyeCenterX = ((face.keypoints[33].x + face.keypoints[263].x) / 2);
        const eyeCenterY = ((face.keypoints[33].y + face.keypoints[263].y) / 2);
        const eyevecX = eyeCenterX - ((face.keypoints[159].x + face.keypoints[386].x) / 2);
        const eyevecY = eyeCenterY - ((face.keypoints[159].y + face.keypoints[386].y) / 2);
        let eyeAngle = Math.atan2(-eyevecY, eyevecX) * (180 / Math.PI);

        // Учет наклона и поворота головы
        const landmarks = face.keypoints;
        const leftEye = landmarks[23];
        const rightEye = landmarks[28];
        const nose = landmarks[5];
        const leftEar = landmarks[234];
        const rightEar = landmarks[454];
        const eyesCenterX = (leftEye.x + rightEye.x) / 2;
        const eyesCenterY = (leftEye.y + rightEye.y) / 2;
        let headAngle = Math.atan2(nose.y - eyesCenterY, nose - eyesCenterX) * (180 / Math.PI);

        // const radians = (-headAngle * Math.PI) / 180;
        // const rotatedEyeX = (eyeCenterX - nose.x) * Math.cos(radians) - (eyeCenterY - nose.y) * Math.sin(radians) + nose[0];
        // const rotatedEyeY = (eyeCenterX - nose.x) * Math.sin(radians) + (eyeCenterY - nose.y) * Math.cos(radians) + nose[1];
        // eyeAngle -= headAngle;

        // Проверка угла на изменение и корректировку точности отслеживания взгляда
        const angleThreshold = 10;
        if (Math.abs(eyeAngle - this.previousEyeAngle) > angleThreshold) {
            const eyeScale = (leftEyeWidth + rightEyeWidth) / 2;
            const correctedAngle = eyeAngle * (45 / eyeScale);
            // Эмуляция события "на пользователь не смотрят"
            if (Math.abs(correctedAngle) > angleThreshold) {
                console.log('User is looking away');
            }
        }
        this.previousEyeAngle = eyeAngle;
    }

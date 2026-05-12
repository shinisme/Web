/*
useForm
→ input 값 관리 + 에러 검증 도와주는 훅
*/

import { useEffect, useState, type ChangeEvent } from "react";

/*
useState → 입력값, 에러, touched 상태 저장
useEffect → 입력값이 바뀔 때마다 검증 실행
ChangeEvent → input 변경 이벤트 타입
*/

interface UseFormProps<T> {
  init_val: T; // input들의 초기값
  validate: (values: T) => Record<keyof T, string>; // 입력값이 맞는지 검사하는 함수
}

function useForm<T>({ init_val, validate }: UseFormProps<T>) {
  const [values, setValues] = useState<T>(init_val); // 현재 input 값들 저장
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // 사용자가 해당 input을 한 번이라도 건드렸는지 저장

  const [errors, setErrors] = useState<Record<string, string>>({});
  // 각 input의 에러 메시지 저장

  const handleChange = (name: keyof T, text: string) => {
    setValues({
      ...values, // 기존 값 유지
      [name]: text, // 바뀐 input만 새 값으로 바꾸기
    });
  };
  // 사용자가 input에 글자를 입력하면 그 input의 값을 values에 저장

  const handleBlur = (name: keyof T) => {
    setTouched({
      ...touched, // 기존 touched 상태 유지
      [name]: true, // 해당 input은 이제 touched 됐다고 표시
    });
  };

  const getInputProps = (name: keyof T) => {
    const value = values[name];

    const onChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      handleChange(name, e.target.value);
    };

    const onBlur = () => {
      handleBlur(name);
    };

    return { value, onChange, onBlur };
  };
  // input 컴포넌트에 getInputProps("username") 이렇게 쓰면
  // 그 input의 value, onChange, onBlur가 자동으로 연결되도록 해주는 함수

  useEffect(() => {
    const newErrors = validate(values);
    setErrors(newErrors);
  }, [values, validate]);
  /*
  values가 바뀔 때마다 validate 함수로 에러 검사
  검사 결과를 errors에 저장
  */

  return { values, errors, touched, getInputProps };
}

export default useForm;
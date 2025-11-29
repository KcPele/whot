import React from "react";
import { Link } from "react-router-dom";
import style from "./index.module.css";

type ErrorPageProps = {
  errorText: string;
};

function ErrorPage({ errorText }: ErrorPageProps) {
  return (
    <div className={style.error}>
      <p>{errorText}</p>
      <Link to={"/"} className={style.btn}>
        GO HOME
      </Link>
    </div>
  );
}

export default ErrorPage;

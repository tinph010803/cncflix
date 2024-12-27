import clsx from "clsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./Watch.module.scss";
import Comment from "../../components/Layout/components/Comments";
import storage from "../../util";
import useFetch from "../../Hooks/useFetch";
import MovieSuggestions from "../../components/Layout/components/MovieSuggestions";
import {
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../components/Layout/components/toastMessage";

function Watch() {
  const params = useParams();
  const [data] = useFetch(`https://phimapi.com/phim/${params.slug}`);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState("");
  const [movie, setMovie] = useState([]);
  const [slug, setSlug] = useState("");
  const [movieName, setMovieName] = useState("");
  const [episode, setEpisode] = useState(1);
  const [linkEmbed, setLinkEmbed] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!data) return;

    const serverList = data?.episodes.map((ep) => ({
      name: ep.server_name,
      data: ep.server_data,
    }));
    setServers(serverList || []);

    if (serverList?.length > 0) {
      setSelectedServer(serverList[0].name);
      setMovie(serverList[0].data || []);
      setSlug(data?.movie?.slug || "");
      setLinkEmbed(serverList[0]?.data[0]?.link_embed || "");
    }

    setMovieName(
      `${data?.movie?.name} - ${serverList[0]?.data[0]?.name}` || ""
    );
  }, [data]);

  useEffect(() => {
    document.title = `Bạn đang xem: ${movieName}`;
  }, [movieName]);

  const handleServerChange = (serverName) => {
    const selected = servers.find((server) => server.name === serverName);
    if (selected) {
      setSelectedServer(serverName);
      setMovie(selected.data || []);
      setLinkEmbed(selected.data[0]?.link_embed || "");
      setEpisode(1);
    }
  };

  const hanleChangeEpisode = (link_embed, index) => {
    setEpisode(index);
    setLinkEmbed(link_embed);
  };

  const handleCopyLinkM3u8 = () => {
    navigator.clipboard
      .writeText(linkEmbed)
      .then(() => {
        showSuccessMessage("Đã copy thành công!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className={styles.watch}>
      <h4 className={styles.watch__title}>{movieName}</h4>
      <div className={styles.watch__iframe}>
        <iframe
          src={linkEmbed}
          frameBorder="0"
          className="video"
          allow="fullscreen"
        ></iframe>
      </div>
      <div className={styles.watch__servers}>
        <h4 className={styles.server__title}>Chọn Server:</h4>
        <div className={styles.server__list}>
          {servers.map((server) => (
            <button
              key={server.name}
              onClick={() => handleServerChange(server.name)}
              className={clsx(styles.server__button, {
                [styles.active]: server.name === selectedServer,
              })}
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.watch__episodes}>
        <h4 className={styles.watch__title}>
          Danh sách tập phim ( {data?.movie?.lang} )
        </h4>
        <ul>
          {movie.map((ep, index) => (
            <li
              key={index}
              className={clsx({
                [styles.active]: ++index === episode,
              })}
              onClick={() => hanleChangeEpisode(ep.link_embed, index)}
            >
              {ep.name}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.watch__copy_box}>
        <h4 className={styles.watch__title}>Link m3u8</h4>
        <div className={styles.watch__copy_area}>
          <button
            onClick={handleCopyLinkM3u8}
            className={clsx("btn", "btn--primary")}
          >
            Copy
          </button>
          <p>{linkEmbed}</p>
        </div>
      </div>
      {slug && <Comment slug={slug} />}
      {data && <MovieSuggestions data={data} />}
    </div>
  );
}

export default Watch;
